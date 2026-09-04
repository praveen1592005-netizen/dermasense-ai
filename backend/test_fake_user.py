import os
from supabase import create_client

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")
client = create_client(url, key)

res = client.auth.sign_up({
    "email": "testuser_real@example.com",
    "password": "Password123!"
})
print(res.user)
print(getattr(res.user, 'identities', None))
