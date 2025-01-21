function formatTimeInterval(seconds:number) {
  const days = Math.floor(seconds /86400);
  const hours = Math.floor((seconds % 86400) / (3600));
  const minutes = Math.floor((seconds % (3600)) / 60); 
  const remainingSeconds = seconds % 60;
  return {
    days,
    hours,
    minutes,
    remainingSeconds
  }
}
export {
    formatTimeInterval
}