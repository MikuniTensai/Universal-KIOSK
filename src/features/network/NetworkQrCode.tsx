import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface NetworkQrCodeProps {
  url: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const NetworkQrCode: React.FC<NetworkQrCodeProps> = ({
  url,
  size = 180,
  className = '',
  darkColor = '#0F172A',
  lightColor = '#FFFFFF',
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const generate = async () => {
      try {
        const svg = await QRCode.toString(url, {
          type: 'svg',
          margin: 1,
          width: size,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'M',
        });

        const dataUri = await QRCode.toDataURL(url, {
          width: size,
          margin: 1,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'M',
        });

        if (isMounted) {
          setSvgContent(svg);
          setDataUrl(dataUri);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [url, size, darkColor, lightColor]);

  if (!svgContent && !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 rounded-xl animate-pulse ${className}`}
      >
        <span className="text-xs text-slate-400 font-mono">Membuat QR...</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm ${className}`}
      title={`Pindai QR: ${url}`}
    >
      {svgContent ? (
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="[&>svg]:w-full [&>svg]:h-full flex items-center justify-center"
          style={{ width: size, height: size }}
        />
      ) : (
        <img
          src={dataUrl}
          alt={`QR Code untuk ${url}`}
          width={size}
          height={size}
          className="rounded"
        />
      )}
    </div>
  );
};
