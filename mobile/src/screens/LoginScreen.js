import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { globalStyles, COLORS } from '../styles';
import { login } from '../api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ username, password });
      if (res.data.success) {
        onLogin(res.data.token);
      } else {
        Alert.alert('Error', res.data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[globalStyles.screen, { justifyContent: 'center', padding: 24 }]}>
      <View style={[globalStyles.card, { paddingVertical: 40 }]}>
        <Text style={[globalStyles.pageTitle, { textAlign: 'center', marginBottom: 8 }]}>🌿 FreshFruits Pro</Text>
        <Text style={[globalStyles.emptyText, { padding: 0, marginBottom: 30 }]}>Sign in to continue</Text>

        <Text style={globalStyles.inputLabel}>Username</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter username"
          placeholderTextColor="rgba(134,239,172,0.45)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={globalStyles.inputLabel}>Password</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter password"
          placeholderTextColor="rgba(134,239,172,0.45)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[globalStyles.btn, { marginTop: 20 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#052e16" />
          ) : (
            <Text style={globalStyles.btnText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
