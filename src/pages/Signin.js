import React, { useEffect } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../style/style.css'
import Loading from '../components/general/loading';
import { useAuthState } from "react-firebase-hooks/auth";
import Swal from "sweetalert2";

const idRole = 'Signin';

const Signin = () => {
  const { googleSignIn } = UserAuth();
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      //console.log(error);
      console.error("Error during Google sign-in:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Oops... ' + error.message,
        text: 'There was an error during sign-in. Please try again.',
      });
    }
  };

  useEffect(() => {
    if (loading) {
      return;
    }
    if (user) navigate("/");
  }, [user, loading]);

  return (

    <section className="vh-100 gradient-custom">
      <div className="container py-5">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card bg-dark text-white" >
              <div className="card-body p-5 text-center">
                <h1 className='text-center text-3xl font-bold py-8'>Sign in</h1>
                <div className='max-w-[240px] m-auto py-4'>
                  {loading ? (<Loading></Loading>) : (<GoogleButton className="google" onClick={handleGoogleSignIn} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default Signin;