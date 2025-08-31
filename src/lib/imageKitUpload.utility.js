const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Request failed with status ${response.status}: ${error.message}`
      );
    }
    const data = await response.json();
    const { signature, expire, token, publicKey } = data;
    return { signature, expire, token, publicKey };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication request failed");
  }
};

export { authenticator };
