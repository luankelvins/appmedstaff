// Centralizando a exportação de todos os controllers
import employeeController from './employeeController.js';
import taskController from './taskController.js';
import leadController from './leadController.js';
import clientePFController from './clientePFController.js';
import clientePJController from './clientePJController.js';
import notificationController from './notificationController.js';
import expenseController from './expenseController.js';

export {
  employeeController,
  taskController,
  leadController,
  clientePFController,
  clientePJController,
  notificationController,
  expenseController
};