# Cart Service - Environment Variables Setup

The Cart Service uses a `.env` file to configure its runtime environment.  
This file should be placed in the root directory of the `cart-service` project.

---

## Example `.env` File

```env
PORT=3003
MONGODB_URI=mongodb+srv://<username>:<password>@cartservice.on54uuc.mongodb.net/
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=cartjwtkey
PRODUCT_SERVICE_URL=http://localhost:3002
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```
