import {Injectable} from '@angular/core';

const brain = require('../libaries/brain.js');

@Injectable()
export class BrainService {

  constructor() {
    //
  }

  calcTank(aktuellerAnalogWert: number): string {
    const trainingData = [
      {input: [80], output: [0]},
      {input: [380], output: [0.1]},
      {input: [523], output: [0.4]},
      {input: [633], output: [0.5]},
      {input: [804], output: [0.8]},
      {input: [804], output: [0.8]},
      {input: [871], output: [1]}, // Ist
    ];

    const net = new brain.NeuralNetwork();

    net.train(trainingData);

    const output = net.run([aktuellerAnalogWert]);

    console.log(output);

    return (output[0] * 100).toFixed() + ' %';
  }

}
