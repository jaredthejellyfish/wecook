import React from 'react';

import { ClerkProvider } from '@clerk/tanstack-start';
import { dark } from '@clerk/themes';

import { useTheme } from '../providers/theme-provider';

type Props = {
  children: React.ReactNode;
};

const ClerkProviderThemed = ({ children }: Props) => {
  const { theme } = useTheme();
  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === 'light' ? undefined : dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderThemed;
