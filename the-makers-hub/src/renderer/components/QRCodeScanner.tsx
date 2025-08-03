import React from 'react';
import { QrReader } from 'react-qr-reader';

interface Props {
  onScan: (data: string | null) => void;
}

const QRCodeScanner: React.FC<Props> = ({ onScan }) => {
  return (
    <QrReader
      onResult={(result, error) => {
        if (result) {
          onScan(result?.getText());
        }

        if (error) {
          console.info(error);
        }
      }}
      constraints={{ facingMode: 'environment' }}
    />
  );
};

export default QRCodeScanner;
