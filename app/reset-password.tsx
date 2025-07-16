"use client"

import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) alert('Reset failed: ' + error.message);
    else alert('Password updated successfully!');
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
      />
      <button onClick={handleReset}>Submit</button>
    </div>
  );
}