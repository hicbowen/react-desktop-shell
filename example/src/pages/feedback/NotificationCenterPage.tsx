import { useState } from 'react'
import { AppButton, AppNotificationCenter, AppNotificationIndicator, type AppNotification, useAppToast } from '../../../../src'
import { DemoPage, DemoPreview, DemoSection } from '../../components/DemoPage'
import { useDemoCopy } from '../../i18n/interactiveTranslations'

export function AppNotificationCenterPage() {
  const t = useDemoCopy()
  const toast = useAppToast()
  const allNotifications: AppNotification[] = [
    { id: 'build', title: t('Build completed'), body: t('The release package is ready to open.'), timestamp: t('Just now'), status: 'success', actions: [{ key: 'open', label: t('Open'), primary: true }] },
    { id: 'review', title: t('Review requested'), body: t('Ada mentioned you in Quarterly report.'), timestamp: t('12 minutes ago'), status: 'info' },
    { id: 'sync', title: t('Sync paused'), body: t('Sign in again to continue synchronization.'), timestamp: t('Yesterday'), status: 'warning', read: true },
  ]
  const allIds = allNotifications.map((notification) => notification.id)
  const [visibleIds, setVisibleIds] = useState(allIds)
  const [readIds, setReadIds] = useState(() => new Set(['sync']))
  const notifications = allNotifications.filter((notification) => visibleIds.includes(notification.id)).map((notification) => ({ ...notification, read: readIds.has(notification.id) }))
  const markRead = (id: string, read: boolean) => setReadIds((current) => { const next = new Set(current); if (read) next.add(id); else next.delete(id); return next })
  const restore = () => { setVisibleIds(allIds); setReadIds(new Set(['sync'])) }
  return <DemoPage><DemoSection title="Notification history" description="Present persistent application events with unread state, actions, and host-controlled lifecycle."><DemoPreview><div style={{ display: 'grid', gap: 12 }}><div style={{ alignItems: 'center', display: 'flex', gap: 8 }}><strong>{t('Inbox')}</strong><AppNotificationIndicator notifications={notifications} /><AppButton onClick={restore} size="compact">{t('Restore')}</AppButton></div><AppNotificationCenter notifications={notifications} onAction={() => toast.info(t('Notification action completed'))} onClearAll={() => setVisibleIds([])} onDismiss={(id) => setVisibleIds((items) => items.filter((item) => item !== id))} onInvoke={(id) => markRead(id, true)} onMarkAllRead={() => setReadIds(new Set(visibleIds))} onMarkRead={markRead} /></div></DemoPreview></DemoSection></DemoPage>
}
