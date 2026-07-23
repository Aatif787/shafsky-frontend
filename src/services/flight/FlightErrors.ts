export class FlightError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "FlightError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class FlightValidationError extends FlightError {
  constructor(message: string) {
    super(message, "INVALID_FORMAT");
    this.name = "FlightValidationError";
  }
}

export class FlightNotFoundError extends FlightError {
  constructor(flightNum: string) {
    super(`Flight number ${flightNum} was not found on the specified date.`, "FLIGHT_NOT_FOUND");
    this.name = "FlightNotFoundError";
  }
}

export class FlightAPIError extends FlightError {
  constructor(message: string, code: string = "API_PROVIDER_ERROR") {
    super(message, code);
    this.name = "FlightAPIError";
  }
}
