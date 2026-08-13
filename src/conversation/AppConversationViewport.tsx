import { useLayoutEffect, useRef, useState } from 'react'
import { AppButton } from '../button'
import { useAppLocale } from '../localization/useAppLocale'
import { AppScrollArea } from '../scroll-area'
import type { AppConversationViewportProps } from './types'
import './AppConversationViewport.css'

const FOLLOW_OUTPUT_THRESHOLD = 48

export function AppConversationViewport({
  ariaLabel,
  children,
  className,
  followOutput = true,
  hasMore = false,
  latestLabel,
  loadEarlierLabel,
  loadingOlder = false,
  loadingEarlierLabel,
  onLoadOlder,
  style,
  viewportClassName,
  viewportStyle,
  ...rest
}: AppConversationViewportProps) {
  const { messages } = useAppLocale()
  const text = messages.conversation
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const shouldFollowOutputRef = useRef(followOutput)
  const previousFollowOutputRef = useRef(followOutput)
  const pendingOlderLoadRef = useRef<{
    scrollHeight: number
    scrollTop: number
  } | null>(null)
  const [showJumpToLatest, setShowJumpToLatest] = useState(false)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    if (pendingOlderLoadRef.current && !loadingOlder) {
      const previous = pendingOlderLoadRef.current
      const addedHeight = viewport.scrollHeight - previous.scrollHeight
      viewport.scrollTop = Math.max(0, previous.scrollTop + addedHeight)
      pendingOlderLoadRef.current = null
    }

    if (followOutput && !previousFollowOutputRef.current) {
      shouldFollowOutputRef.current = true
      setShowJumpToLatest(false)
    }
    previousFollowOutputRef.current = followOutput

    if (followOutput && shouldFollowOutputRef.current) {
      viewport.scrollTop = viewport.scrollHeight
    }
  }, [children, loadingOlder, followOutput])

  const handleScroll = () => {
    const viewport = viewportRef.current
    if (!viewport || !followOutput) return

    const distanceFromBottom =
      viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop
    const shouldFollow = distanceFromBottom <= FOLLOW_OUTPUT_THRESHOLD
    shouldFollowOutputRef.current = shouldFollow
    setShowJumpToLatest(!shouldFollow)
  }

  const jumpToLatest = () => {
    const viewport = viewportRef.current
    shouldFollowOutputRef.current = true
    setShowJumpToLatest(false)
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }

  const loadEarlier = () => {
    if (!onLoadOlder || loadingOlder) return
    const viewport = viewportRef.current
    if (viewport) {
      pendingOlderLoadRef.current = {
        scrollHeight: viewport.scrollHeight,
        scrollTop: viewport.scrollTop,
      }
    }
    onLoadOlder()
  }

  return (
    <div
      {...rest}
      aria-label={ariaLabel ?? text.label}
      className={['app-conversation-viewport', className]
        .filter(Boolean)
        .join(' ')}
      role="region"
      style={style}
    >
      <AppScrollArea
        className="app-conversation-viewport__scroll"
        onScroll={handleScroll}
        ref={viewportRef}
        viewportClassName={[
          'app-conversation-viewport__viewport',
          viewportClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        viewportStyle={viewportStyle}
      >
        {hasMore ? (
          <div className="app-conversation-viewport__load-earlier">
            <AppButton
              disabled={!onLoadOlder || loadingOlder}
              loading={loadingOlder}
              onClick={loadEarlier}
              size="compact"
            >
              {loadingOlder
                ? (loadingEarlierLabel ?? text.loadingEarlier)
                : (loadEarlierLabel ?? text.loadEarlier)}
            </AppButton>
          </div>
        ) : null}
        {children}
      </AppScrollArea>
      {followOutput && showJumpToLatest ? (
        <AppButton
          className="app-conversation-viewport__jump"
          onClick={jumpToLatest}
          size="compact"
        >
          {latestLabel ?? text.jumpToLatest}
        </AppButton>
      ) : null}
    </div>
  )
}
