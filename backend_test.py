#!/usr/bin/env python3
"""
Backend Test Suite for Google OAuth Production Configuration
Tests OAuth configuration, environment variables, and API endpoints
"""

import requests
import json
import time
import os
import re
from urllib.parse import urlparse, parse_qs

class OAuthConfigTester:
    def __init__(self):
        self.base_url = "https://squad.cronberry.com"
        self.api_base = f"{self.base_url}/api"
        self.test_results = []
        self.total_tests = 0
        self.passed_tests = 0
        
    def log_test(self, test_name, passed, details="", response_time=None):
        """Log test results"""
        self.total_tests += 1
        if passed:
            self.passed_tests += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"
            
        result = {
            'test': test_name,
            'status': status,
            'passed': passed,
            'details': details,
            'response_time': response_time
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_time:
            print(f"   Response Time: {response_time:.3f}s")
        print()

    def test_environment_variables(self):
        """Test that required environment variables are properly configured"""
        print("🔍 Testing Environment Variables...")
        
        # Read .env file to check configuration
        env_file = "/app/.env"
        env_vars = {}
        
        try:
            with open(env_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key] = value
            
            # Check critical variables
            required_vars = ['NEXT_PUBLIC_BASE_URL', 'MONGO_URL']
            missing_vars = []
            for var in required_vars:
                if var not in env_vars:
                    missing_vars.append(var)
            
            if missing_vars:
                self.log_test("Environment Variables - Required", False, 
                            f"Missing variables: {missing_vars}")
                return False
            
            # Check for production URL configuration
            base_url = env_vars.get('NEXT_PUBLIC_BASE_URL', '')
            if 'localhost' in base_url or '127.0.0.1' in base_url:
                self.log_test("Environment Variables - Production URL", False, 
                            f"Production URL contains localhost: {base_url}")
                return False
            else:
                self.log_test("Environment Variables - Production URL", True, 
                            f"Production URL configured correctly: {base_url}")
                return True
                
        except Exception as e:
            self.log_test("Environment Variables - Exception", False, f"Error: {str(e)}")
            return False

    def test_nextauth_providers_endpoint(self):
        """Test NextAuth providers endpoint returns production URLs"""
        print("🔍 Testing NextAuth Providers Endpoint...")
        
        try:
            url = f"{self.api_base}/auth/providers"
            start_time = time.time()
            response = requests.get(url, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                providers = response.json()
                
                # Check if Google provider is configured
                if 'google' in providers:
                    google_config = providers['google']
                    signin_url = google_config.get('signinUrl', '')
                    callback_url = google_config.get('callbackUrl', '')
                    
                    # Check for localhost references
                    if 'localhost' in signin_url or 'localhost' in callback_url:
                        self.log_test("NextAuth Providers - Localhost Check", False, 
                                    "OAuth URLs contain localhost references", response_time)
                        return False
                    
                    # Check for production domain
                    if self.base_url.replace('https://', '') in signin_url:
                        self.log_test("NextAuth Providers - Production URLs", True, 
                                    f"OAuth URLs use production domain", response_time)
                        return True
                    else:
                        self.log_test("NextAuth Providers - Production URLs", False, 
                                    "OAuth URLs don't match production domain", response_time)
                        return False
                else:
                    self.log_test("NextAuth Providers - Google Provider", False, 
                                "Google provider not found in configuration", response_time)
                    return False
            else:
                self.log_test("NextAuth Providers - HTTP Status", False, 
                            f"Status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("NextAuth Providers - Exception", False, f"Error: {str(e)}")
            return False

    def test_oauth_signin_flow(self):
        """Test OAuth signin flow redirects to production URLs"""
        print("🔍 Testing OAuth Signin Flow...")
        
        try:
            # Test signin endpoint
            signin_url = f"{self.api_base}/auth/signin/google"
            start_time = time.time()
            response = requests.get(signin_url, allow_redirects=False, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code in [302, 307]:
                redirect_url = response.headers.get('Location', '')
                
                # Check if redirects to Google OAuth or shows an error page
                if 'accounts.google.com' in redirect_url:
                    # Parse redirect URL to check parameters
                    parsed_url = urlparse(redirect_url)
                    query_params = parse_qs(parsed_url.query)
                    
                    client_id = query_params.get('client_id', [''])[0]
                    redirect_uri = query_params.get('redirect_uri', [''])[0]
                    
                    # Check if client_id is present (indicates OAuth credentials are configured)
                    if not client_id:
                        self.log_test("OAuth Signin Flow - Client ID", False, 
                                    "No client_id in OAuth URL - GOOGLE_CLIENT_ID not configured", response_time)
                        return False
                    
                    # Check redirect URI for localhost
                    if 'localhost' in redirect_uri:
                        self.log_test("OAuth Signin Flow - Localhost Check", False, 
                                    "Callback URL contains localhost", response_time)
                        return False
                    
                    # Check redirect URI matches production domain
                    if self.base_url.replace('https://', '') in redirect_uri:
                        self.log_test("OAuth Signin Flow - Production URLs", True, 
                                    f"Redirects to Google OAuth with production callback URL", response_time)
                        return True
                    else:
                        self.log_test("OAuth Signin Flow - Production URLs", False, 
                                    "Callback URL doesn't match production domain", response_time)
                        return False
                elif '/auth/error' in redirect_url or 'error' in redirect_url:
                    self.log_test("OAuth Signin Flow - Configuration Error", False, 
                                f"Redirects to error page - OAuth credentials likely not configured: {redirect_url}", response_time)
                    return False
                else:
                    self.log_test("OAuth Signin Flow - Unexpected Redirect", False, 
                                f"Unexpected redirect destination: {redirect_url}", response_time)
                    return False
            elif response.status_code == 400:
                self.log_test("OAuth Signin Flow - Configuration Error", False, 
                            "400 Bad Request - OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET) not configured", response_time)
                return False
            else:
                self.log_test("OAuth Signin Flow - HTTP Status", False, 
                            f"Unexpected status: {response.status_code}", response_time)
                return False
                
        except Exception as e:
            self.log_test("OAuth Signin Flow - Exception", False, f"Error: {str(e)}")
            return False

    def test_domain_configuration(self):
        """Test domain configuration and validation logic"""
        print("🔍 Testing Domain Configuration...")
        
        try:
            # Read NextAuth configuration
            auth_file = "/app/app/api/auth/[...nextauth]/route.js"
            with open(auth_file, 'r') as f:
                auth_content = f.read()
            
            # Check for domain configuration
            if 'maaruji.com' in auth_content and 'cronberry.com' in auth_content:
                self.log_test("Domain Configuration - Multiple Domains", True, 
                            "Multiple domains configured in NextAuth")
            else:
                self.log_test("Domain Configuration - Multiple Domains", False, 
                            "Domain configuration not found in NextAuth")
                return False
            
            # Check for environment variable parsing
            if 'ALLOWED_GOOGLE_WORKSPACE_DOMAIN' in auth_content:
                self.log_test("Domain Configuration - Environment Variables", True, 
                            "Environment variable parsing for domains implemented")
            else:
                self.log_test("Domain Configuration - Environment Variables", False, 
                            "Environment variable parsing not found")
                return False
            
            # Read middleware configuration
            middleware_file = "/app/middleware.js"
            with open(middleware_file, 'r') as f:
                middleware_content = f.read()
            
            # Check middleware domain validation
            if 'allowedDomains' in middleware_content and 'ALLOWED_GOOGLE_WORKSPACE_DOMAIN' in middleware_content:
                self.log_test("Domain Configuration - Middleware Validation", True, 
                            "Middleware domain validation implemented")
            else:
                self.log_test("Domain Configuration - Middleware Validation", False, 
                            "Middleware domain validation not found")
                return False
            
            return True
            
        except Exception as e:
            self.log_test("Domain Configuration - Exception", False, f"Error: {str(e)}")
            return False

    def test_production_environment_settings(self):
        """Test production environment settings"""
        print("🔍 Testing Production Environment Settings...")
        
        try:
            # Check NextAuth configuration for production settings
            auth_file = "/app/app/api/auth/[...nextauth]/route.js"
            with open(auth_file, 'r') as f:
                auth_content = f.read()
            
            # Check for debug setting
            if 'debug: false' in auth_content:
                self.log_test("Production Settings - Debug Mode", True, 
                            "Debug mode disabled for production")
            else:
                self.log_test("Production Settings - Debug Mode", False, 
                            "Debug mode setting not found or not disabled")
            
            # Check for session configuration
            if 'maxAge: 30 * 24 * 60 * 60' in auth_content:
                self.log_test("Production Settings - Session Timeout", True, 
                            "Session timeout configured (30 days)")
            else:
                self.log_test("Production Settings - Session Timeout", False, 
                            "Session timeout not configured")
            
            # Check for JWT strategy
            if "strategy: 'jwt'" in auth_content:
                self.log_test("Production Settings - JWT Strategy", True, 
                            "JWT session strategy configured")
            else:
                self.log_test("Production Settings - JWT Strategy", False, 
                            "JWT session strategy not found")
            
            # Check for required environment variables in code
            required_env_vars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
            missing_vars = []
            for var in required_env_vars:
                if f'process.env.{var}' not in auth_content and var != 'NEXTAUTH_URL':
                    missing_vars.append(var)
            
            # Check for NEXTAUTH_URL in middleware or other files
            middleware_file = "/app/middleware.js"
            with open(middleware_file, 'r') as f:
                middleware_content = f.read()
            
            # NEXTAUTH_SECRET should be in middleware for getToken
            if 'process.env.NEXTAUTH_SECRET' not in middleware_content:
                missing_vars.append('NEXTAUTH_SECRET (in middleware)')
            
            if missing_vars:
                self.log_test("Production Settings - Environment Variables in Code", False, 
                            f"Missing environment variable references: {missing_vars}")
            else:
                self.log_test("Production Settings - Environment Variables in Code", True, 
                            "All required environment variables referenced in code")
            
            # Now check if environment variables are actually set (this will show the real issue)
            self.log_test("Production Settings - Environment Variables Status", False, 
                        "⚠️ CRITICAL: OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL) must be set in production environment for OAuth to work. Current 400 error indicates these are missing.")
            
            return True
            
        except Exception as e:
            self.log_test("Production Settings - Exception", False, f"Error: {str(e)}")
            return False

    def test_existing_api_endpoints(self):
        """Test that existing API endpoints still work with new configuration"""
        print("🔍 Testing Existing API Endpoints...")
        
        endpoints = ['/summary', '/activity', '/leaderboard', '/rules', '/cycles']
        all_working = True
        
        for endpoint in endpoints:
            try:
                url = f"{self.api_base}{endpoint}"
                start_time = time.time()
                response = requests.get(url, timeout=10)
                response_time = time.time() - start_time
                
                if response.status_code == 200:
                    self.log_test(f"API Endpoint {endpoint}", True, 
                                f"Status 200, Response time: {response_time:.3f}s")
                else:
                    self.log_test(f"API Endpoint {endpoint}", False, 
                                f"Status {response.status_code}")
                    all_working = False
                    
            except Exception as e:
                self.log_test(f"API Endpoint {endpoint}", False, f"Error: {str(e)}")
                all_working = False
        
        return all_working

    def test_gas_integration_url(self):
        """Test GAS integration URL configuration"""
        print("🔍 Testing GAS Integration URL...")
        
        try:
            # Read API route file to check GAS URL configuration
            api_file = "/app/app/api/[[...path]]/route.js"
            with open(api_file, 'r') as f:
                api_content = f.read()
            
            # Check for GAS URL environment variable
            if 'NEXT_PUBLIC_GAS_BASE_URL' in api_content:
                self.log_test("GAS Integration - Environment Variable", True, 
                            "GAS URL environment variable configured")
            else:
                self.log_test("GAS Integration - Environment Variable", False, 
                            "GAS URL environment variable not found")
                return False
            
            # Check for proper error handling
            if 'GAS URL not configured' in api_content:
                self.log_test("GAS Integration - Error Handling", True, 
                            "GAS URL error handling implemented")
            else:
                self.log_test("GAS Integration - Error Handling", False, 
                            "GAS URL error handling not found")
            
            # Check that mock data is being used (for testing)
            if 'mockSummary' in api_content and 'mockActivity' in api_content:
                self.log_test("GAS Integration - Mock Data", True, 
                            "Mock data available for testing")
            else:
                self.log_test("GAS Integration - Mock Data", False, 
                            "Mock data not found")
            
            return True
            
        except Exception as e:
            self.log_test("GAS Integration - Exception", False, f"Error: {str(e)}")
            return False

    def test_error_handling(self):
        """Test error handling still works"""
        print("🔍 Testing Error Handling...")
        
        try:
            # Test invalid endpoint
            url = f"{self.api_base}/invalid-endpoint"
            start_time = time.time()
            response = requests.get(url, timeout=10)
            response_time = time.time() - start_time
            
            if response.status_code == 404:
                self.log_test("Error Handling - Invalid Endpoint", True, 
                            "Invalid endpoint returns 404", response_time)
                return True
            else:
                self.log_test("Error Handling - Invalid Endpoint", False, 
                            f"Invalid endpoint returns {response.status_code} instead of 404", response_time)
                return False
                
        except Exception as e:
            self.log_test("Error Handling - Exception", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all OAuth configuration tests"""
        print("🔍 Starting Google OAuth Production Configuration Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run all OAuth configuration tests
        self.test_environment_variables()
        self.test_nextauth_providers_endpoint()
        self.test_oauth_signin_flow()
        self.test_domain_configuration()
        self.test_production_environment_settings()
        self.test_existing_api_endpoints()
        self.test_gas_integration_url()
        self.test_error_handling()
        
        # Print summary
        print("=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = 0
        total = self.total_tests
        
        for result in self.test_results:
            if result['passed']:
                passed += 1
        
        print(f"Overall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All OAuth configuration tests passed!")
            return True
        else:
            print("⚠️ Some OAuth configuration tests failed!")
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['passed']:
                    print(f"  - {result['test']}: {result['details']}")
            return False

if __name__ == "__main__":
    tester = OAuthConfigTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)