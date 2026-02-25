'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  Clock,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { FloodAlert as FloodAlertType } from '@/types';
import { ALERT_LEVELS } from '@/lib/constants';
import { getTimeAgo } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FloodAlertProps {
  alert: FloodAlertType;
  onDismiss?: (id: string) => void;
  className?: string;
}

const alertIcons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  critical: ShieldAlert,
};

export function FloodAlert({ alert, onDismiss, className }: FloodAlertProps) {
  const AlertIcon = alertIcons[alert.level];
  const alertConfig = ALERT_LEVELS[alert.level];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn('relative', className)}
    >
      <Card
        className={cn(
          'border-l-4 shadow-lg hover:shadow-xl transition-shadow',
          alertConfig.bgColor,
          alertConfig.borderColor,
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{
                  scale: alert.level === 'critical' ? [1, 1.1, 1] : 1,
                  rotate: alert.level === 'critical' ? [0, 5, -5, 0] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: alert.level === 'critical' ? Infinity : 0,
                  repeatType: 'reverse',
                }}
              >
                <AlertIcon
                  className={cn('h-6 w-6', alertConfig.textColor)}
                  style={{ color: alertConfig.color }}
                />
              </motion.div>

              <div className="flex-1">
                <CardTitle className={cn('text-lg', alertConfig.textColor)}>
                  {alert.title}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge
                    variant={
                      alert.level === 'critical'
                        ? 'danger'
                        : alert.level === 'danger'
                          ? 'danger'
                          : alert.level === 'warning'
                            ? 'warning'
                            : 'info'
                    }
                    className="uppercase"
                  >
                    {alert.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{getTimeAgo(alert.timestamp)}</span>
                  </span>
                </div>
              </div>
            </div>

            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDismiss(alert.id)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className={cn('text-sm', alertConfig.textColor)}>
              {alert.message}
            </p>

            {/* Affected Areas */}
            {alert.affectedAreas && alert.affectedAreas.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Wilayah Terdampak:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alert.affectedAreas.map((area, index) => (
                    <Badge key={index} variant="outline" size="sm">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            {alert.actions && alert.actions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Tindakan yang Disarankan:
                  </span>
                </div>
                <ul className="space-y-1">
                  {alert.actions.map((action, index) => (
                    <li
                      key={index}
                      className="text-sm flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 bg-current rounded-full" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Estimated Duration */}
            {alert.estimatedDuration && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Estimasi durasi: {alert.estimatedDuration} jam
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Alert List Component
interface FloodAlertListProps {
  alerts: FloodAlertType[];
  onDismiss?: (id: string) => void;
  className?: string;
}

export function FloodAlertList({
  alerts,
  onDismiss,
  className,
}: FloodAlertListProps) {
  const activeAlerts = alerts.filter((alert) => alert.isActive);
  const sortedAlerts = activeAlerts.sort((a, b) => {
    const levelOrder = { critical: 4, danger: 3, warning: 2, info: 1 };
    return levelOrder[b.level] - levelOrder[a.level];
  });

  return (
    <div className={cn('space-y-4', className)}>
      {sortedAlerts.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <div className="text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4" />
              <p>Tidak ada peringatan aktif saat ini</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          {sortedAlerts.map((alert) => (
            <FloodAlert key={alert.id} alert={alert} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
