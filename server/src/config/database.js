import mongoose from 'mongoose';

const encodeMongoURI = (uri) => {
  if (!uri) return uri;
  
  // If it's a MongoDB Atlas connection string, encode the password part
  if (uri.includes('mongodb+srv://') || uri.includes('mongodb://')) {
    try {
      // Replace mongodb+srv:// with https:// temporarily for URL parsing
      const tempUri = uri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'http://');
      const url = new URL(tempUri);
      
      // If password exists and contains special characters, encode it
      if (url.password) {
        // Encode only the password part
        const encodedPassword = encodeURIComponent(url.password);
        url.password = encodedPassword;
        let result = url.toString();
        // Restore the original protocol
        result = result.replace('https://', 'mongodb+srv://').replace('http://', 'mongodb://');
        return result;
      }
      
      return uri;
    } catch (e) {
      // If URL parsing fails, try to manually encode password in connection string
      // Pattern: mongodb+srv://username:password@host or mongodb://username:password@host
      const patterns = [
        /(mongodb\+srv:\/\/[^:]+:)([^@]+)(@)/,
        /(mongodb:\/\/[^:]+:)([^@]+)(@)/
      ];
      
      for (const pattern of patterns) {
        const match = uri.match(pattern);
        if (match) {
          const encodedPassword = encodeURIComponent(match[2]);
          return uri.replace(match[0], `${match[1]}${encodedPassword}${match[3]}`);
        }
      }
      
      return uri;
    }
  }
  
  return uri;
};

const validateMongoURI = (uri) => {
  if (!uri) return { valid: false, error: 'URI is empty' };
  
  // Check if it's a valid MongoDB connection string
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    return { valid: false, error: 'Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://' };
  }
  
  // For mongodb+srv, check if hostname is present
  if (uri.startsWith('mongodb+srv://')) {
    const match = uri.match(/mongodb\+srv:\/\/(?:[^:]+:[^@]+@)?([^/]+)/);
    if (!match || !match[1]) {
      return { valid: false, error: 'Invalid mongodb+srv URI: missing hostname' };
    }
    const hostname = match[1];
    if (!hostname.includes('.mongodb.net') && !hostname.includes('.mongodb.com')) {
      return { valid: false, error: `Invalid Atlas hostname: ${hostname}. Should end with .mongodb.net or .mongodb.com` };
    }
  }
  
  return { valid: true };
};

const maskURI = (uri) => {
  if (!uri) return 'not set';
  // Mask password in connection string for logging
  return uri.replace(/:\/\/[^:]+:([^@]+)@/, '://***:***@');
};

const getMongoURI = () => {
  // Check if we're in production/cloud environment
  if (process.env.NODE_ENV === 'production' || process.env.MONGODB_ATLAS_URI) {
    const atlasURI = process.env.MONGODB_ATLAS_URI;
    if (!atlasURI) {
      console.warn('⚠️  MONGODB_ATLAS_URI is not set but NODE_ENV is production. Falling back to local MongoDB.');
      return process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/nature_app';
    }
    return encodeMongoURI(atlasURI);
  }
  
  // Local development
  return process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/nature_app';
};

const connectDB = async () => {
  try {
    const mongoURI = getMongoURI();
    const isCloud = mongoURI && (mongoURI.includes('mongodb.net') || mongoURI.includes('atlas'));
    
    console.log(`Connecting to MongoDB: ${isCloud ? 'Cloud (Atlas)' : 'Local'}`);
    console.log(`URI: ${maskURI(mongoURI)}`);
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not configured. Please set MONGODB_LOCAL_URI or MONGODB_ATLAS_URI in .env file');
    }
    
    // Validate URI format
    const validation = validateMongoURI(mongoURI);
    if (!validation.valid) {
      throw new Error(`Invalid MongoDB connection string: ${validation.error}`);
    }
    
    const options = {
      // Common options for both local and cloud
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // Increased timeout for DNS resolution
      socketTimeoutMS: 45000,
    };

    // Additional options for cloud/Atlas
    if (isCloud) {
      options.retryWrites = true;
      options.w = 'majority';
      // Increase server selection timeout for Atlas
      options.serverSelectionTimeoutMS = 15000;
    }

    await mongoose.connect(mongoURI, options);
    
    console.log(`✅ MongoDB connected successfully (${isCloud ? 'Cloud' : 'Local'})`);
    console.log(`Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if your MongoDB Atlas connection string is complete');
      console.error('2. Verify the cluster hostname ends with .mongodb.net');
      console.error('3. Ensure your IP address is whitelisted in MongoDB Atlas');
      console.error('4. Check your internet connection');
      console.error('5. For development, consider using local MongoDB:');
      console.error('   Set NODE_ENV=development and MONGODB_LOCAL_URI in .env');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if username and password are correct');
      console.error('2. Ensure special characters in password are URL-encoded');
      console.error('3. Verify database user has proper permissions');
    } else if (error.message.includes('Invalid MongoDB connection string')) {
      console.error('\n💡 Check your .env file:');
      console.error('   MONGODB_ATLAS_URI should be in format:');
      console.error('   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    }
    
    // Don't exit in development if we can fallback to local
    if (process.env.NODE_ENV === 'development' && process.env.MONGODB_LOCAL_URI) {
      console.error('\n⚠️  Attempting to use local MongoDB instead...');
      try {
        const localURI = process.env.MONGODB_LOCAL_URI || 'mongodb://127.0.0.1:27017/nature_app';
        await mongoose.connect(localURI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to local MongoDB instead');
        return;
      } catch (localError) {
        console.error('❌ Local MongoDB connection also failed:', localError.message);
      }
    }
    
    process.exit(1);
  }
};

export default connectDB;
