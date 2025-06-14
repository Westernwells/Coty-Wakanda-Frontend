export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString;
  }
};

export const formatMonthYear = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${year}`;
  } catch (error) {
    return dateString;
  }
}; 