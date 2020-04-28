import './HttpError'

/* eslint-disable padded-blocks */
export class HttpServerError extends HttpError { }
export class InternalServerErrorError extends HttpServerError { static representsCode = 500 }
export class NotImplementedError extends HttpServerError { static representsCode = 501 }
export class BadGatewayError extends HttpServerError { static representsCode = 502 }
export class ServiceUnavailableError extends HttpServerError { static representsCode = 503 }
export class GatewayTimeoutError extends HttpServerError { static representsCode = 504 }
export class HTTPVersionNotSupportedError extends HttpServerError { static representsCode = 505 }
export class VariantAlsoNegotiatesError extends HttpServerError { static representsCode = 506 }
export class InsufficientStorageError extends HttpServerError { static representsCode = 507 }
export class LoopDetectedError extends HttpServerError { static representsCode = 508 }
export class BandwidthLimitExceededError extends HttpServerError { static representsCode = 509 }
export class NotExtendedError extends HttpServerError { static representsCode = 510 }
export class NetworkAuthenticationRequiredError extends HttpServerError { static representsCode = 511 }
