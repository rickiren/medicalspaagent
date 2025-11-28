import { BusinessConfig, BookingDetails } from '../types';

export function handleBookingRequest(
  config: BusinessConfig,
  bookingDetails: BookingDetails
): { success: boolean; message: string; confirmationId?: string } {
  const { booking } = config;
  
  // Find the service to validate it exists
  const service = config.services.find(s => 
    s.name.toLowerCase() === bookingDetails.service.toLowerCase()
  );

  if (!service) {
    return {
      success: false,
      message: `Sorry, we don't offer "${bookingDetails.service}". Available services: ${config.services.map(s => s.name).join(', ')}.`
    };
  }

  switch (booking.type) {
    case 'mock':
      // Return fake confirmation
      const confirmationId = `CONF-${Date.now()}`;
      return {
        success: true,
        message: `✅ Appointment confirmed!\n\nService: ${service.name}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nConfirmation: ${confirmationId}\n\n${booking.requiresPayment ? `Payment of $${service.price} will be collected at the appointment.` : 'No payment required at booking.'}`,
        confirmationId
      };

    case 'calendly':
      // In a real implementation, you would redirect to Calendly or use their API
      return {
        success: true,
        message: `Please complete your booking at: ${booking.calendarUrl || 'our booking page'}\n\nService: ${service.name}\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}`
      };

    case 'custom':
      // In a real implementation, you would call the custom API
      return {
        success: true,
        message: `Booking request received for ${service.name} on ${bookingDetails.date} at ${bookingDetails.time}. Our team will confirm shortly.`
      };

    default:
      return {
        success: false,
        message: 'Booking system is not configured properly.'
      };
  }
}

