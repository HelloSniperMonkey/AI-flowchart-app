declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BACKEND_API: string;
            NODE_ENV: 'development' | 'production';
        }
    }
}

export { };