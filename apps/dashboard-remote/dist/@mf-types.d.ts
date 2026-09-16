
    export type RemoteKeys = 'REMOTE_ALIAS_IDENTIFIER/Dashboard' | 'REMOTE_ALIAS_IDENTIFIER/Mount';
    type PackageType<T> = T extends 'REMOTE_ALIAS_IDENTIFIER/Mount' ? typeof import('REMOTE_ALIAS_IDENTIFIER/Mount') :T extends 'REMOTE_ALIAS_IDENTIFIER/Dashboard' ? typeof import('REMOTE_ALIAS_IDENTIFIER/Dashboard') :any;