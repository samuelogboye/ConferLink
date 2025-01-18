///////////////////////////////////////////////////////////////////////
// DO NOT CHANGE THE ORDER OF THE IMPORTS;
// DOT ENV AND MODULE ALIAS WILL NOT WORK PROPERLY UNLESS THEY ARE IMPORTED FIRST
import * as dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
	require('module-alias/register');
}

///////////////////////////////////////////////////////////////////////
import { ENVIRONMENT, connectDb, disconnectDb } from '@/common/config';
import '@/common/interfaces/request';
import { logger, stream } from '@/common/utils';
import { errorHandler } from '@/controllers';
import { timeoutMiddleware } from '@/middlewares';
import { seederRouter, userRouter } from '@/routes';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet, { HelmetOptions } from 'helmet';
import helmetCsp from 'helmet-csp';
import hpp from 'hpp';
import http from 'http';
import morgan from 'morgan';
// import { WebSocket } from 'ws';
import { Server } from "socket.io"
import { authRouter } from './routes/authRouter';
import { roomHandler } from './controllers/room';

dotenv.config();
/**
 *  uncaughtException handler
 */
process.on('uncaughtException', async (error: Error) => {
	console.error('UNCAUGHT EXCEPTION!! 💥 Server Shutting down... ' + new Date(Date.now()) + error.name, error.message);
	process.exit(1);
});

/**
 * Default app configurations
 */
const app: Express = express();
const port = ENVIRONMENT.APP.PORT;
const appName = ENVIRONMENT.APP.NAME;

/**
 * Express configuration
 */
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']); // Enable trust proxy
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

/**
 * Compression Middleware
 */
app.use(compression());

// Rate limiter middleware
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

//Middleware to allow CORS from frontend
app.use(
	cors({
		origin: '*',
		credentials: true,
	})
);
//Configure Content Security Policy (CSP)
//prevent Cross-Site Scripting (XSS) attacks by not allowing the loading of content from other domains.
const contentSecurityPolicy = {
	directives: {
		defaultSrc: ["'self'"],
		scriptSrc: ["'self'"],
		styleSrc: ["'self'"],
		imgSrc: ["'self'"],
		frameAncestors: ["'none'"],
		objectSrc: ["'none'"],
		upgradeInsecureRequests: [],
	},
};

// Use Helmet middleware for security headers
app.use(
	helmet({
		contentSecurityPolicy: false, // Disable the default CSP middleware
	})
);
// Use helmet-csp middleware for Content Security Policy
app.use(helmetCsp(contentSecurityPolicy));

const helmetConfig: HelmetOptions = {
	// X-Frame-Options header to prevent clickjacking
	frameguard: { action: 'deny' },
	// X-XSS-Protection header to enable browser's built-in XSS protection
	xssFilter: true,
	// Referrer-Policy header
	referrerPolicy: { policy: 'strict-origin' },
	// Strict-Transport-Security (HSTS) header for HTTPS enforcement
	hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
};

app.use(helmet(helmetConfig));

//Secure cookies and other helmet-related configurations
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.permittedCrossDomainPolicies());

// Prevent browser from caching sensitive information
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
	res.set('Pragma', 'no-cache');
	res.set('Expires', '0');
	next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: ['date', 'createdAt'], // whitelist some parameters
	})
);

/**
 * Logger Middleware
 */
app.use(morgan(ENVIRONMENT.APP.ENV !== 'development' ? 'combined' : 'dev', { stream }));
// Add request time to req object
app.use((req: Request, res: Response, next: NextFunction) => {
	req['requestTime'] = new Date().toISOString();
	next();
});

/**
 * Initialize routes
 */
app.use('/api/v1/alive', (req, res) =>
	res.status(200).json({ status: 'success', message: 'Server is up and running, innit?' })
);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/seeder', seederRouter);

app.all('/*', async (req, res) => {
	logger.error('route not found ' + new Date(Date.now()) + ' ' + req.originalUrl);
	res.status(404).json({
		status: 'error',
		message: `OOPs!! No handler defined for ${req.method.toUpperCase()}: ${
			req.url
		} route. Check the API documentation for more details.`,
	});
});

/**
 * Bootstrap server
 */

// to ensure all the express middlewares are set up before starting the socket server
// including security headers and other middlewares
const server = http.createServer(app);

// Websocket
const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("user is connected");
	roomHandler(socket);
	socket.on("disconnect", () => {
		console.log("user is disconnected");
	})
});

const appServer = server.listen(port, async () => {
	await connectDb();
	console.log(`==> App ${appName ? `: ${appName}` : ''} is running on port ${port}`);
});
/**
 * Error handler middlewares
 */
app.use(timeoutMiddleware);
app.use(errorHandler);

/**
 * unhandledRejection  handler
 */
process.on('unhandledRejection', async (error: Error) => {
	logger.error('UNHANDLED REJECTION! 💥 Server Shutting down... ' + new Date(Date.now()) + error.name, error.message);
	appServer.close(() => {
		process.exit(1);
	});
});

async function shutdown() {
	console.log('Shutting down...');
	await disconnectDb();
	process.exit(0);
}

// graceful shutdown on SIGINT and SIGTERM
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
