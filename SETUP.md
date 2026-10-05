# SSC CGL Exam Platform - Setup Guide

## ✅ Quick Start

Your Supabase credentials are already configured in the `.env` file. Follow these steps to complete the setup:

### Step 1: Run Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/
2. Select your project: `astdxzjqapgfdfvzhfdx`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

This will create:
- ✅ All database tables (papers, attempts, bookmarks, mistakes, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Auto-profile creation trigger

### Step 2: Enable Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Optional: Configure email templates in **Authentication** → **Email Templates**

### Step 3: Start the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🎯 Features Overview

### For Students/Exam Takers

1. **Exam Library** - Browse and search imported question papers
2. **Take Exam** - Full exam interface with timer, navigation, and auto-save
3. **Practice Mode** - Practice specific topics or weak areas
4. **Results & Analytics** - Detailed performance analysis after each exam
5. **Mistake Notebook** - Review and learn from incorrect answers
6. **Bookmarks** - Save important questions for later review
7. **Performance Dashboard** - Track progress over time

### For Administrators/Content Creators

1. **Import Papers** - Paste JSON or upload .json files
2. **AI Prompt Generator** - Generate optimized prompts for AI question generation
3. **Validation** - Automatic JSON validation with detailed error messages
4. **Export** - Export papers back to JSON format
5. **Paper Management** - Edit, duplicate, or delete papers

## 📝 Importing Your First Paper

### Option 1: Use the Demo Paper

The app automatically loads a demo paper on first run. You can start taking exams immediately!

### Option 2: Import Custom Paper

1. Click **Import Paper** in the top navigation
2. Choose one of these methods:
   - **Paste JSON**: Copy your question paper JSON and paste it
   - **Upload File**: Click to upload a .json file
   - **Load Demo**: Use the built-in demo paper
   - **AI Prompt Generator**: Generate a prompt to create questions with AI

3. Click **Validate** to check the JSON structure
4. If valid, click **Import** to save the paper
5. The paper will appear in your Exam Library

### JSON Format Example

```json
{
  "paperTitle": "SSC CGL Mock Test 1",
  "description": "Practice test for SSC CGL preparation",
  "duration": 60,
  "totalMarks": 100,
  "negativeMarking": 0.25,
  "difficulty": "medium",
  "subjects": ["Quantitative Aptitude", "Reasoning", "English", "General Awareness"],
  "questions": [
    {
      "id": 1,
      "subject": "Quantitative Aptitude",
      "topic": "Percentages",
      "difficulty": "easy",
      "question": "What is 20% of 500?",
      "options": ["80", "90", "100", "110"],
      "correctAnswer": "100",
      "answerIndex": 2,
      "marks": 2,
      "negativeMarks": 0.5,
      "hint": "Use the formula: (Percentage/100) × Total",
      "solution": "20% of 500 = (20/100) × 500 = 0.2 × 500 = 100",
      "shortcut": "10% of 500 = 50, so 20% = 50 × 2 = 100",
      "learningSuggestion": "Practice percentage calculations regularly"
    }
  ]
}
```

## 🧪 Testing the Application

### Test User Registration

1. Click **Sign Up** in the top right
2. Enter email, password, and display name
3. Check your email for verification link (if email confirmation is enabled)
4. Log in with your credentials

### Test Exam Flow

1. Go to **Exam Library**
2. Click on any paper card
3. Click **Start Exam**
4. Answer some questions
5. Try these features:
   - Navigate between questions
   - Mark questions for review
   - Check the timer
   - Submit the exam
6. View your results and analytics

### Test Practice Mode

1. Go to **Practice** tab
2. Select a practice mode:
   - **Topic Practice**: Focus on specific topics
   - **Weak Area Practice**: Practice your weakest areas
   - **Previous Mistakes**: Review questions you got wrong
   - **Random Practice**: Mix of all questions
3. Complete the practice session
4. View detailed feedback

## 🔐 Security Notes

- ✅ Only the anon key is exposed in the frontend (safe)
- ✅ Row Level Security (RLS) ensures users can only access their own data
- ✅ Never commit the `.env` file to version control
- ✅ The secret key should only be used server-side (not in this app)

## 🐛 Troubleshooting

### "Failed to load papers"
- Check that you ran the SQL schema in Supabase
- Verify your `.env` file has correct credentials
- Check browser console for detailed error messages

### "Authentication failed"
- Ensure Email provider is enabled in Supabase
- Check that your email is verified (if confirmation is required)
- Try resetting your password

### "Paper validation failed"
- Check the error messages for specific issues
- Ensure all required fields are present
- Verify JSON syntax is correct
- Use the AI Prompt Generator to create valid JSON

## 📊 Database Tables

After running the schema, you'll have these tables:

- **profiles** - User profile information
- **papers** - Question papers and metadata
- **attempts** - Exam attempt records
- **attempt_questions** - Individual question responses
- **bookmarks** - Saved questions
- **mistakes** - Questions answered incorrectly

## 🚀 Deployment

To deploy to production:

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables on your hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

For GitHub Pages deployment, see the GitHub Actions workflow in `.github/workflows/deploy.yml`.

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase dashboard for any issues
3. Ensure all environment variables are set correctly
4. Check that the SQL schema was run successfully

---

**Your app is now ready to use!** Start by importing some question papers and taking your first exam.
