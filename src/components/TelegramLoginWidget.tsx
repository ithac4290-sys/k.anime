'use client';

import React, { useEffect, useRef } from 'react';

interface TelegramLoginWidgetProps {
  botName?: string;
  authUrl?: string;
  size?: 'small' | 'medium' | 'large';
  radius?: number;
  requestAccess?: string;
  className?: string;
}

export default function TelegramLoginWidget({
  botName = 'KOD_E_bot',
  authUrl = 'https://k.animovie.uz/auth/telegram/callback',
  size = 'large',
  radius = 14,
  requestAccess = 'write',
  className = ''
}: TelegramLoginWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', size);
    script.setAttribute('data-radius', String(radius));
    script.setAttribute('data-auth-url', authUrl);
    script.setAttribute('data-request-access', requestAccess);
    script.async = true;

    containerRef.current.appendChild(script);
  }, [botName, authUrl, size, radius, requestAccess]);

  return (
    <div 
      ref={containerRef} 
      className={`telegram-login-container flex items-center justify-center my-2 ${className}`} 
    />
  );
}
