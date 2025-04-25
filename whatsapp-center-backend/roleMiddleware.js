module.exports = function(requiredRoles) {
  return (req, res, next) => {
    // Pastikan authMiddleware sudah dijalankan sebelumnya,
    // sehingga req.user sudah berisi { userId, role, iat, exp }
    const userRole = req.user.role;

    // requiredRoles bisa berupa array, misalnya ['superadmin', 'owner'] 
    // berarti hanya superadmin atau owner yang bisa akses
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({ msg: 'Forbidden. You do not have access to this resource.' });
    }

    next();
  };
};