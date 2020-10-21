export interface Logger {
	info(...message: any[]): void
	comment(...message: any[]): void
	warn(...message: any[]): void
	error(...message: any[]): void
	success(...message: any[]): void
}
