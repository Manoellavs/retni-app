
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/Transactions' | 'REMOTE_ALIAS_IDENTIFIER/Mount';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/Mount' ? typeof import('REMOTE_ALIAS_IDENTIFIER/Mount') :T extends 'REMOTE_ALIAS_IDENTIFIER/Transactions' ? typeof import('REMOTE_ALIAS_IDENTIFIER/Transactions') :any;