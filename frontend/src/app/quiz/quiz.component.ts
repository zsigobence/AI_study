import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz',
  imports: [FormsModule,NgIf, NgFor],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {

  id: string = '67c81db18d07329ed749679e';//beégetés kiszedése folyamatban...
  questions: any[] = [];
  currentQuestionIndex: number = 0;
  correctAnswer: string = '';
  score: number = 0;
  quizFinished: boolean = false;
  timeLeft: number = 20;
  timer: any;
  answerRevealed: boolean = false;
  answer : any[] = [];
  myAnswer : string = "";

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getQuestions();
  }

  getQuestions(): void {
    this.apiService.getQuestionsById(this.id).subscribe(
      (response) => {
        if (response.questions && response.questions.length > 0) {
          if (response.questions[0].length == 2){
          this.questions = response.questions.map((q: [string, string]) => ({
            question: q[0], 
            answer: q[1]
          }));
          console.log(this.questions)

        } else {
          this.questions = response.questions.map((q: [string]) => ({
            question: q
          }));
          console.log(this.questions)

        }this.shuffleQuestions();
        this.startTimer();
        } else {
          console.log('Nincsenek kérdések!');
        }
      },
      (error) => {
        console.error('Hiba történt a kérdések lekérésekor:', error);
      }
    );
  }

  shuffleQuestions(): void {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }

  startTimer(): void {
    this.timeLeft = 30;
    this.answerRevealed = false; 
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeUp();
      }
    }, 1000);
  }

  answerTFQuestion(selectedAnswer: string): void {
    if (this.answerRevealed) return;

    clearInterval(this.timer);
    this.correctAnswer = this.questions[this.currentQuestionIndex].answer;
    this.answerRevealed = true;

    if (selectedAnswer === this.correctAnswer) {
      this.score++;
    }

    setTimeout(() => this.nextQuestion(), 2000);
  }

  answerSQSAQuestion(): void {
    if (this.answerRevealed) return;

    clearInterval(this.timer);
    this.answerRevealed = true;
    this.correctAnswer = '';
    this.apiService.getAnswer(this.id, this.questions[this.currentQuestionIndex].question, this.myAnswer ).subscribe(
      (response) => {
        if (response.answer && response.answer.length > 0) {
          this.answer = response.answer
        }
        if(this.answer[0] === "IGAZ"){
          this.correctAnswer = "IGAZ"
          this.score++;
        } else {
          console.log(this.answer[1])
          this.correctAnswer = this.answer[1];
        }
        this.answerRevealed = true;
    },
    (error) => {
      console.error('Hiba történt a kérdés kiértékelésekor:', error);
    })
    
    this.myAnswer = ""
  }

  timeUp(): void {
    clearInterval(this.timer);
    this.correctAnswer = '';
    if(this.questions.length == 2){
    this.correctAnswer = this.questions[this.currentQuestionIndex].answer;
    }else {
      this.answerSQSAQuestion()
    }
    this.answerRevealed = true;
    this.myAnswer = ""
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.correctAnswer = '';
      this.answerRevealed = false;
      this.startTimer();
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    clearInterval(this.timer);
    this.quizFinished = true;
  }



}
