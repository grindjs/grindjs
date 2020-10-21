import { Log as LogClass } from './Log'
import * as Errors from './Errors'

declare global {
	var Log: typeof LogClass

	// Errors
	var BadGatewayError: typeof Errors.BadGatewayError
	var BadRequestError: typeof Errors.BadRequestError
	var BandwidthLimitExceededError: typeof Errors.BandwidthLimitExceededError
	var ConflictError: typeof Errors.ConflictError
	var ExpectationFailedError: typeof Errors.ExpectationFailedError
	var FailedDependencyError: typeof Errors.FailedDependencyError
	var ForbiddenError: typeof Errors.ForbiddenError
	var GatewayTimeoutError: typeof Errors.GatewayTimeoutError
	var GoneError: typeof Errors.GoneError
	var HttpClientError: typeof Errors.HttpClientError
	var HttpError: typeof Errors.HttpError
	var HttpServerError: typeof Errors.HttpServerError
	var HTTPVersionNotSupportedError: typeof Errors.HTTPVersionNotSupportedError
	var ImATeapotError: typeof Errors.ImATeapotError
	var InsufficientStorageError: typeof Errors.InsufficientStorageError
	var InternalServerErrorError: typeof Errors.InternalServerErrorError
	var LengthRequiredError: typeof Errors.LengthRequiredError
	var LockedError: typeof Errors.LockedError
	var LoopDetectedError: typeof Errors.LoopDetectedError
	var MethodNotAllowedError: typeof Errors.MethodNotAllowedError
	var MisdirectedRequestError: typeof Errors.MisdirectedRequestError
	var NetworkAuthenticationRequiredError: typeof Errors.NetworkAuthenticationRequiredError
	var NotAcceptableError: typeof Errors.NotAcceptableError
	var NotExtendedError: typeof Errors.NotExtendedError
	var NotFoundError: typeof Errors.NotFoundError
	var NotImplementedError: typeof Errors.NotImplementedError
	var PayloadTooLargeError: typeof Errors.PayloadTooLargeError
	var PaymentRequiredError: typeof Errors.PaymentRequiredError
	var PreconditionFailedError: typeof Errors.PreconditionFailedError
	var PreconditionRequiredError: typeof Errors.PreconditionRequiredError
	var ProxyAuthenticationRequiredError: typeof Errors.ProxyAuthenticationRequiredError
	var RangeNotSatisfiableError: typeof Errors.RangeNotSatisfiableError
	var RequestHeaderFieldsTooLargeError: typeof Errors.RequestHeaderFieldsTooLargeError
	var RequestTimeoutError: typeof Errors.RequestTimeoutError
	var ServiceUnavailableError: typeof Errors.ServiceUnavailableError
	var TooManyRequestsError: typeof Errors.TooManyRequestsError
	var UnauthorizedError: typeof Errors.UnauthorizedError
	var UnavailableForLegalReasonsError: typeof Errors.UnavailableForLegalReasonsError
	var UnorderedCollectionError: typeof Errors.UnorderedCollectionError
	var UnprocessableEntityError: typeof Errors.UnprocessableEntityError
	var UnsupportedMediaTypeError: typeof Errors.UnsupportedMediaTypeError
	var UpgradeRequiredError: typeof Errors.UpgradeRequiredError
	var URITooLongError: typeof Errors.URITooLongError
	var VariantAlsoNegotiatesError: typeof Errors.VariantAlsoNegotiatesError
}
