export const handleError = (error, toast, customMessage) => {
  console.error(error);
  toast({
    variant: "destructive",
    title: "Error",
    description: customMessage || error.message,
  });
};
