import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_KEY, AuditMetadata } from './audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const metadata = this.reflector.get<AuditMetadata>(AUDIT_KEY, context.getHandler());

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // rempli par JwtAuthGuard — vérifie le nom exact du champ (id ou userId)

    return next.handle().pipe(
      tap((responseData) => {
        const entiteId = request.params?.id || request.params?.projetId || responseData?.id;

        this.auditService.log({
          user_id: user?.id ?? user?.userId,
          user_email: user?.email,
          action: metadata.action,
          entite: metadata.entite,
          entite_id: entiteId ? Number(entiteId) : undefined,
          ip_address: request.ip,
        });
      }),
    );
  }
}