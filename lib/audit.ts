import { prisma } from './db';

export async function createAuditLog(
    adminUserId: number,
    action: string,
    entityType: string,
    entityId?: number,
    changes?: any,
    request?: Request
) {
    try {
        const ipAddress = request?.headers.get('x-forwarded-for') ||
            request?.headers.get('x-real-ip') ||
            undefined;
        const userAgent = request?.headers.get('user-agent') || undefined;

        await prisma.auditLog.create({
            data: {
                adminUserId,
                action,
                entityType,
                entityId,
                changes,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw - audit logging should not break the main operation
    }
}
