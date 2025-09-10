import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState({
    loading: true,
    success: false,
    message: ''
  });

  const { token } = useParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/api/auth/verify-email/${token}`);
        setVerificationStatus({
          loading: false,
          success: true,
          message: response.data.message
        });
      } catch (error) {
        setVerificationStatus({
          loading: false,
          success: false,
          message: error.response?.data?.message || 'Verification failed. Please try again.'
        });
      }
    };

    verifyEmail();
  }, [token]);

  if (verificationStatus.loading) {
    return (
      <div className="container mt-5">
        <div className="card p-4">
          <div className="text-center">
            <h2>Verifying your email...</h2>
            <div className="loading mt-3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <div className="text-center">
          {verificationStatus.success ? (
            <div className="alert alert-success">
              <h2>Email Verified!</h2>
              <p>{verificationStatus.message}</p>
              <Link to="/login" className="btn btn-primary mt-3">Login Now</Link>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h2>Verification Failed</h2>
              <p>{verificationStatus.message}</p>
              <p>Please try again or contact support if the problem persists.</p>
              <Link to="/login" className="btn btn-primary mt-3">Back to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;