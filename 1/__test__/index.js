/*
  Что стоит проверить в коде студента:
  — проверим, есть ли вооще такой div.content
  — проверяем stylesheet на наличие vh (в том числе случаи с пробелом в значении)
  — проверяем stylesheet на наличие %
  — `html, body { height: 100%; }`
  — проверяем inline style

  Используя cssText проверяем сразу использование свойства вне скобок
 */

const errors = [];

const sheetsFileName = 'style.css';

/**
*	Основная идея проверки работы - не сразу ругать, а познакомить студента с вариантами решения задачи и уже потом можно ругать.
*	Поэтому правило из задания считается приоритетным, 
*	в случае ошибки всех - текст будет показан из первого. 
*	Мы можем студента сильно не ругать, если он использовал другую конструкцию.
*   
*   Парсер CSS уже есть, его мы использовать не будем
*   https://www.npmjs.com/package/cssparser
*/

const rules = [
{
	/*
		По идее, студент может "чтобы проверить" стереть теговую часть селектора 
		тогда, стоит использовать шаблон без теговой части селектора
		так как они идентичны, в рамках этой задачи
	*/

  	place: 'sheets', 
  	element: ['div.content'], 
  	attribute: ['height'], 
  	value: ['100vh'],
  	errorText: 'Высота элемента div, согласно заданию, должна быть 100vh (без пробела). Рекомендуем проверить значение свойства height элемента div.content',
  	success: false,
  	main: true
  },
  { 
  	place: 'sheets', 
  	element: ['div.content'], 
  	attribute: ['min-height'], 
  	value: ['100vh'], 
  	errorText: 'Использование min-height, не соответствует задаче, но не является грубой ошибкой. В будущем, использование этого свойства может сломать верстку. Следуйте рекомендациям задания.',
  	success: false,
  	main: false
  },
  {
  	place: 'sheets', 
  	element: ['html, body', 'div.content'],
  	attribute: ['height', 'height'],  
  	value: ['100%', '100%'],
    errorText: 'Для решения задачи значение высоты элемента div.content может быть равно 100%. Конечно, это не ошибка верстки, но лучше действовать по заданию.',
    success: false,
  	main: false
  },
  {
  	place: 'inline', 
  	element: ['div.content'], 
  	attribute: ['height'], 
  	value: ['100vh'],
  	errorText: 'Высоту элемента div, согласно заданию, следует изменить в файле style.css. Inline CSS — не ошибка, но так верстать метрические параметры элемента не рекомендуется.',
  	success: false,
  	main: false
  }
];

//стрелочные функции, for..of и прочее не поддерживаются IE + некоторых Edge 

const getStyleText = function(sheet, className) {
	var cssText = "";
	var classes = sheet.rules || sheet.cssRules;
	for (var x = 0; x < classes.length; x++) {        
		if (classes[x].selectorText === className) {
			cssText += classes[x].cssText || classes[x].style.cssText;
		}         
	}
	return cssText;
}

const checkDocument = function() {

	rules.forEach(function(rule, i, rules) {
		if (rule.place === 'sheets') {
			//проверяем стили в файле styleSheets
			checkInStyle(rule); 
		} else if (rule.place === 'inline') {
			//проверяем inline стили
			checkInline(rule);
		}
	});

	let softErrorsSheets = rules.filter(function(rule) {
			return rule.success === true && rule.place === 'sheets'
		});


	let softErrorsInline = rules.filter(function(rule) {
			return rule.success === true && rule.place === 'inline'
		});

	if (softErrorsSheets.length === 0 && softErrorsInline.length === 0) {
		const mainError = rules.filter(function(rule) {
			return rule.main === true
		});

		errors.push(mainError[0].errorText);

	} else if (softErrorsInline.length > 0 && softErrorsSheets.length > 0) {
		//можно поругать за одновременное использование стилей
		errors.push('Не рекомендуем одновременно использовать Inline и Sheets виды стилей');
	} else if (softErrorsSheets.length > 0) {
		softErrorsSheets.forEach(function(error, i, softErrorsSheets) {
			if (!error.main) {
				errors.push(error.errorText);
			}
		});
	} else if (softErrorsInline.length > 0) {
		softErrorsInline.forEach(function(error, i, softErrorsInline) {
			errors.push(error.errorText);
		});
	}
}

const checkInline = function (rule) {
	const ruleElement = rule.element;
	ruleElement.forEach(function(elem, i, ruleElement) {	
		let elemInlineStyle = document.querySelector(elem).style.cssText;
		
		const textRule	= rule.attribute[i] + ": " + rule.value[i]; 

		//здесь используем строгое равенство, потому как в Inline нет форматирования
		//в то же время, может отсутствовать semicolon - важно это учесть

		elemInlineStyle = elemInlineStyle.split('').filter(function(char) {return char !== ';'}).join('');

		if (elemInlineStyle === textRule) { 
			rule.success = true;
		} else {
			rule.success = false;
		} 
	});
}

const checkInStyle = function(rule) {
	let sheets = document.styleSheets;

	for (let sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
		const sheet = sheets[sheetIndex];
		if (!!sheet) {
			if (sheet.href.indexOf(sheetsFileName) > -1) {
				let cssRules = sheets.rules || sheets.cssRules;
				const ruleElement = rule.element;
				for (let i = 0; i < ruleElement.length; i++) {
					/* жаль, что ничего не сказано про Babel, используем ESLint + IE11 plugin
					 * ` ${rule.attribute[i]}: ${rule.value[i]}`
					 * также можно использовать Regex
					 * const regex = /([\s\S]*?){([\s\S]*?)}/gm;
					 * где первая группа - селектор
					 * вторая группа - свойство и его значение
					 */
					let elem = ruleElement[i];
					const styleElem = getStyleText(sheet, elem);

					const textRule	= " " + rule.attribute[i] + ": " + rule.value[i]; 

					//проверка правила, если оно написано в скобках
					if (styleElem.indexOf(textRule) > -1) { 
						rule.success = true;
      				} else {
      					rule.success = false;
      				} 
				}
      		}	
  		}
  	}
}

checkDocument();

console.log(errors);