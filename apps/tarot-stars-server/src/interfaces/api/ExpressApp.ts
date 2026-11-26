import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { TarotRoutes } from './routes/TarotRoutes';


export class ExpressApp {
  private app: Application;


  constructor() {
    this.app = express();
    this.initializeRepositories();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeRepositories(): void {
    // 仓储将在路由中按需初始化
  }

  private initializeMiddlewares(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "https://telegram.org"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.telegram.org"]
        }
      }
    }));

    // CORS 配置 - 开发环境允许所有本地域名
    this.app.use(cors({
      origin: function (origin, callback) {
        // 允许的域名列表
        const allowedOrigins = [
          'https://t.me',
          'https://web.telegram.org',
          process.env.MINI_APP_URL || 'http://localhost:3000',
          'http://localhost:3000',
          'https://localhost:3000',
          'http://127.0.0.1:3000',
          'https://127.0.0.1:3000'
        ];
        
        // 开发环境允许所有本地请求
        if (process.env.NODE_ENV === 'development') {
          if (!origin || 
              origin.includes('localhost') || 
              origin.includes('127.0.0.1') ||
              allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
        }
        
        // 生产环境严格检查
        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Telegram-Web-App-Init-Data',
        'X-Telegram-Web-App-Data'
      ]
    }));

    // 解析 JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 请求日志
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // 健康检查
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'tarot-stars-server'
      });
    });

    // 多语言API路由
    const tarotRoutes = new TarotRoutes();
    this.app.use('/api/tarot', tarotRoutes.getRouter());
    this.app.use('/api/v2/tarot', tarotRoutes.getRouter());

    // 根路径
    this.app.get('/', (_req: Request, res: Response) => {
      res.json({
        message: '🔮 Welcome to Tarot Stars Server',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api/tarot',
          'api-v2': '/api/v2/tarot'
        }
      });
    });

    // 404 处理
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    // 全局错误处理
    this.app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Global error handler:', error);
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });

    // 未捕获的 Promise 拒绝
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // 未捕获的异常
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public listen(port: number): void {
    // 尝试使用HTTPS，如果证书不存在则回退到HTTP
    try {
      const certPath = path.join(__dirname, '../../../../tarot-stars-app/certificates');
      const keyPath = path.join(certPath, 'localhost-key.pem');
      const certFilePath = path.join(certPath, 'localhost.pem');
      
      if (fs.existsSync(keyPath) && fs.existsSync(certFilePath)) {
        const options = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certFilePath)
        };
        
        https.createServer(options, this.app).listen(port, () => {
          console.log(`🚀 Tarot Stars Server is running on HTTPS port ${port}`);
          console.log(`📱 Health check: https://localhost:${port}/health`);
          console.log(`🔮 API endpoint: https://localhost:${port}/api/tarot`);
        });
      } else {
        console.log('⚠️ SSL certificates not found, falling back to HTTP');
        this.app.listen(port, () => {
          console.log(`🚀 Tarot Stars Server is running on HTTP port ${port}`);
          console.log(`📱 Health check: http://localhost:${port}/health`);
          console.log(`🔮 API endpoint: http://localhost:${port}/api/tarot`);
        });
      }
    } catch (error) {
      console.log('⚠️ Failed to start HTTPS server, falling back to HTTP:', error);
      this.app.listen(port, () => {
        console.log(`🚀 Tarot Stars Server is running on HTTP port ${port}`);
        console.log(`📱 Health check: http://localhost:${port}/health`);
        console.log(`🔮 API endpoint: http://localhost:${port}/api/tarot`);
      });
    }
  }
}