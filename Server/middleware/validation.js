// Input validation and sanitization middleware
import validator from 'validator';

// Sanitize user input to prevent XSS and injection attacks
export const sanitizeInput = (req, res, next) => {
  try {
    // Recursively sanitize all string values in req.body
    const sanitizeObject = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          // Escape HTML to prevent XSS
          obj[key] = validator.escape(obj[key].trim());
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };

    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

// Validate email format
export const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next();
};

// Validate mobile phone format
export const validateMobile = (req, res, next) => {
  const { mobile } = req.body;
  
  if (mobile && !validator.isMobilePhone(mobile, 'any')) {
    return res.status(400).json({ error: 'Invalid mobile phone format' });
  }
  
  next();
};

// Validate user registration input
export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, userName, email, mobile, password } = req.body;
  
  const errors = [];
  
  // Required field validation
  if (!firstName || firstName.length < 2 || firstName.length > 50) {
    errors.push('First name must be between 2-50 characters');
  }
  
  if (!lastName || lastName.length < 2 || lastName.length > 50) {
    errors.push('Last name must be between 2-50 characters');
  }
  
  if (!userName || userName.length < 3 || userName.length > 25) {
    errors.push('Username must be between 3-25 characters');
  }
  
  if (!email || !validator.isEmail(email)) {
    errors.push('Valid email is required');
  }
  
  if (!mobile || !validator.isMobilePhone(mobile, 'any')) {
    errors.push('Valid mobile phone is required');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Check for alphanumeric username
  if (userName && !/^[a-zA-Z0-9_]+$/.test(userName)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validate login input
export const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }
  
  if (password.length < 5) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  
  next();
};