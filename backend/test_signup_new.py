import requests
url = 'http://localhost:8000/api/v1/auth/signup'
data = {'email': 'new_user_12345@example.com', 'password': 'Password123!', 'full_name': 'New User'}
print("Signup new:", requests.post(url, json=data).json())

data_exist = {'email': 'testuser_real@example.com', 'password': 'Password123!', 'full_name': 'Existing User'}
print("Signup existing:", requests.post(url, json=data_exist).json())
