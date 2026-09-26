const BASE = 'http://localhost:5000/api/notifications';

/**
 * Admin sends a notification to a customer about their booking.
 */
export const sendNotification = async ({ bookingId, customerId, customerName, customerEmail, vehicleId, vehicleName, message, type }) => {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, customerId, customerName, customerEmail, vehicleId, vehicleName, message, type })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to send notification');
  return data.data;
};

/**
 * Customer fetches all their notifications.
 */
export const getMyNotifications = async (customerId) => {
  const res = await fetch(`${BASE}/customer/${customerId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data.data;
};

/**
 * Fetch notifications for a specific booking.
 */
export const getBookingNotifications = async (bookingId) => {
  const res = await fetch(`${BASE}/booking/${bookingId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data.data;
};

/**
 * Customer marks a notification as read.
 */
export const markNotificationRead = async (notificationId) => {
  const res = await fetch(`${BASE}/${notificationId}/read`, { method: 'PUT' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to mark as read');
  return data.data;
};

/**
 * Admin deletes a notification.
 */
export const deleteNotification = async (notificationId) => {
  const res = await fetch(`${BASE}/${notificationId}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete notification');
  return data;
};
