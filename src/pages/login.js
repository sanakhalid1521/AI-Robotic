import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { useHistory, useLocation } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Call the login function from auth context
      const result = await login(email, password);

      // Redirect to homepage or previous page
      const location = useLocation();
      const from = location.state?.from?.pathname || '/';
      history.push(from);
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Layout title="Login" description="Login to access the Physical AI textbook">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="card">
              <div className="card__header">
                <h2>Login to Your Account</h2>
              </div>
              <div className="card__body">
                {error && <div className="alert alert--danger">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="margin-bottom--md">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="margin-bottom--lg">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="button-group button-group--block">
                    <button type="submit" className="button button--primary">
                      Login
                    </button>
                  </div>
                </form>
              </div>
              <div className="card__footer">
                <p>
                  Don't have an account? <a href="/register">Register here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LoginPage;