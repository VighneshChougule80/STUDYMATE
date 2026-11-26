import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const offlineQuotes = [
  {
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    quote: 'It always seems impossible until it is done.',
    author: 'Nelson Mandela',
  },
  {
    quote: 'Great things are done by a series of small things brought together.',
    author: 'Vincent van Gogh',
  },
  {
    quote: 'Believe you can and you are halfway there.',
    author: 'Theodore Roosevelt',
  },
  {
    quote: 'The future depends on what you do today.',
    author: 'Mahatma Gandhi',
  },
];

export default function QuotesScreen() {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchQuote = useCallback(async () => {
    setMessage('');

    try {
      const response = await fetch('https://dummyjson.com/quotes/random');

      if (!response.ok) {
        throw new Error('Could not load a quote.');
      }

      const data = await response.json();

      if (!data.quote || !data.author) {
        throw new Error('The quote response was incomplete.');
      }

      setQuote({
        quote: data.quote,
        author: data.author,
      });
    } catch (error) {
      const randomQuote =
        offlineQuotes[Math.floor(Math.random() * offlineQuotes.length)];

      setQuote(randomQuote);
      setMessage('Showing an offline quote. Tap “New Quote” to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleNewQuote = () => {
    setLoading(true);
    fetchQuote();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuote();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <Text style={styles.heading}>Daily Motivation</Text>
      <Text style={styles.subtitle}>
        A little inspiration to keep you moving forward.
      </Text>

      <View style={styles.quoteCard}>
        {loading && !quote ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>
              {quote?.quote || 'Your next great idea starts with one small step.'}
            </Text>
            <Text style={styles.author}>— {quote?.author || 'StudyMate'}</Text>
          </>
        )}
      </View>

      {!!message && <Text style={styles.message}>{message}</Text>}

      <TouchableOpacity
        style={styles.button}
        onPress={handleNewQuote}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>New Quote</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.tip}>Pull down to refresh the quote.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F7FB',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#172033',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#667085',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  quoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    minHeight: 230,
    justifyContent: 'center',
    elevation: 3,
  },
  quoteMark: {
    fontSize: 58,
    lineHeight: 65,
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  quoteText: {
    fontSize: 22,
    lineHeight: 33,
    color: '#172033',
    fontWeight: '600',
  },
  author: {
    marginTop: 22,
    fontSize: 16,
    color: '#4F46E5',
    textAlign: 'right',
    fontWeight: '600',
  },
  message: {
    color: '#667085',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tip: {
    color: '#98A2B3',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});