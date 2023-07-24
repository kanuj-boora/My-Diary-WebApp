import sys, json
import pandas as pd
import nltk
import re
from nltk.sentiment.vader import SentimentIntensityAnalyzer

def clean_text(text):
    cleaned_text = re.sub(r"[^a-zA-Z]", " ", text).lower()
    cleaned_text = re.sub(r'\n', ' ', cleaned_text)
    return cleaned_text

def PositiveWordCount(content) :
    count = 0
    
    for word in content:
        if word in pos_words_cleaned:
            count += 1
        
    return count

def NegativeWordCount(content) :
    count = 0
    
    for word in content:
        if word in neg_words_cleaned:
            count += 1
        
    return count

stop_words = nltk.corpus.stopwords.words('english')
stop_words.extend(['today', 'day'])

posts = json.loads(sys.argv[1])

data = pd.DataFrame(posts)
df = pd.DataFrame()

df['time'] = data['time']
df['content'] = data['content'].apply(clean_text)
df['content'] = df['content'].apply(nltk.word_tokenize)
df['content'] = df['content'].apply(
    lambda x: [word for word in x if not word in stop_words])

ss = SentimentIntensityAnalyzer()
df['positive'] = [ss.polarity_scores(i)['pos'] for i in data['content']]
df['negative'] = [ss.polarity_scores(i)['neg'] for i in data['content']]
df['neutral'] = [ss.polarity_scores(i)['neu'] for i in data['content']]
df['compound'] = ['Happy' if ss.polarity_scores(i)['compound'] > 0 else 'Sad' for i in data['content']]

pos_words = []
with open('./positive-words.txt', 'r') as f:
    s = f.readlines()
    pos_words.extend(s)
neg_words = []
with open('./negative-words.txt') as f:
    neg_words.extend(f.readlines())
    
pos_words_cleaned = [word.replace('\n', '') for word in pos_words]
neg_words_cleaned = [word.replace('\n', '') for word in neg_words]

df['pos_word_count'] = df['content'].apply(PositiveWordCount)
df['neg_word_count'] = df['content'].apply(NegativeWordCount)

df_final = df.drop(['content'], axis=1)

df_final['positive'] = (df['positive'] - df['positive'].min()) / (df['positive'].max() - df['positive'].min())
df_final['negative'] = (df['negative'] - df['negative'].min()) / (df['negative'].max() - df['negative'].min())
df_final['neutral'] = (df['neutral'] - df['neutral'].min()) / (df['neutral'].max() - df['neutral'].min())

df_json = df_final.to_json(orient='split', index=False)

print(json.dumps({'pyposts': df_json}))