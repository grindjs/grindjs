import HttpError from 'http-errors'

export function ErrorsProvider(app) {

	global.HttpError = HttpError.HttpError

	global.BadRequestError = HttpError.BadRequest
	global.UnauthorizedError = HttpError.Unauthorized
	global.PaymentRequiredError = HttpError.PaymentRequired
	global.ForbiddenError = HttpError.Forbidden
	global.NotFoundError = HttpError.NotFound
	global.MethodNotAllowedError = HttpError.MethodNotAllowed
	global.NotAcceptableError = HttpError.NotAcceptable
	global.ProxyAuthenticationRequiredError = HttpError.ProxyAuthenticationRequired
	global.RequestTimeoutError = HttpError.RequestTimeout
	global.ConflictError = HttpError.Conflict
	global.GoneError = HttpError.Gone
	global.LengthRequiredError = HttpError.LengthRequired
	global.PreconditionFailedError = HttpError.PreconditionFailed
	global.RequestEntityTooLargeError = HttpError.RequestEntityTooLarge
	global.RequestURITooLongError = HttpError.RequestURITooLong
	global.UnsupportedMediaTypeError = HttpError.UnsupportedMediaType
	global.RequestedRangeNotSatisfiableError = HttpError.RequestedRangeNotSatisfiable
	global.ExpectationFailedError = HttpError.ExpectationFailed
	global.EnhanceYourCalmError = HttpError.EnhanceYourCalm
	global.UnprocessableEntityError = HttpError.UnprocessableEntity
	global.LockedError = HttpError.Locked
	global.FailedDependencyError = HttpError.FailedDependency
	global.UnorderedCollectionError = HttpError.UnorderedCollection
	global.UpgradeRequiredError = HttpError.UpgradeRequired
	global.PreconditionRequiredError = HttpError.PreconditionRequired
	global.TooManyRequestsError = HttpError.TooManyRequests
	global.RequestHeaderFieldsTooLargeError = HttpError.RequestHeaderFieldsTooLarge
	global.NoResponseError = HttpError.NoResponse
	global.RetryWithError = HttpError.RetryWith
	global.BlockedByWindowsParentalControlsError = HttpError.BlockedByWindowsParentalControls
	global.ClientClosedRequestError = HttpError.ClientClosedRequest
	global.InternalServerErrorError = HttpError.InternalServerError
	global.NotImplementedError = HttpError.NotImplemented
	global.BadGatewayError = HttpError.BadGateway
	global.ServiceUnavailableError = HttpError.ServiceUnavailable
	global.GatewayTimeoutError = HttpError.GatewayTimeout
	global.HTTPVersionNotSupportedError = HttpError.HTTPVersionNotSupported
	global.VariantAlsoNegotiatesError = HttpError.VariantAlsoNegotiates
	global.InsufficientStorageError = HttpError.InsufficientStorage
	global.LoopDetectedError = HttpError.LoopDetected
	global.BandwidthLimitExceededError = HttpError.BandwidthLimitExceeded
	global.NotExtendedError = HttpError.NotExtended
	global.NetworkAuthenticationRequiredError = HttpError.NetworkAuthenticationRequired
}
