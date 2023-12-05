const jwt = require("jsonwebtoken");



const revokedTokens = new Set();

// Middleware to check JWT and user authentication
const authenticateToken = (req, res, next)=> {
  const token = req.header('Authorization');
console.log(token);
  if (!token) return res.sendStatus(401);

  if (revokedTokens.has(token)) {
    return res.status(403).send({message:'token is expires'}); // Token is revoked
  }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     req.user = decoded.user;
//     next();
//   } catch (err) {
//     res.status(400).send("Invalid token.");
//   }
  // Verify the token and authenticate the user here (not shown in this simplified example)

  next();
}

module.exports= authenticateToken;