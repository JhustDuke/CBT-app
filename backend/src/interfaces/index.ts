export interface EnrolPayloadInterface {
	fullName: string;
	phoneNumber: string;
	course: string;
	nin: string;
	email: string;
	registrationStatus: "PROCESSING" | "ERROR" | "COMPLETED";
	registrationMessage: string | null;
}

export type NewEnrolPayloadInterface = Pick<
	EnrolPayloadInterface,
	"course" | "fullName" | "phoneNumber" | "nin" | "email"
>;

export interface EnrolStatusInterface {
	registration_status: "PROCESSING" | "ERROR" | "COMPLETED";
	registration_message: string | null;
}
export interface UpdateEnrolStatusInterface {
	phoneNumber: string;
	registrationStatus: "ERROR" | "COMPLETED";
	registrationMessage?: string | null;
}
