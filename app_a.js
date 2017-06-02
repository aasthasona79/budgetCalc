//Budget controller-
var budgetController = (function(){
   
    var Expense = function (id,description,value) {
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var Income = function (id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var calcTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function(current,index,array){
            sum+=current.value;
        });
        
        data.totals[type]=sum;
    }
    var data = {
        allItems: {
            exp:[],
            inc:[]
        },
        totals: {
            exp:[],
            inc:[]
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem:function(type,des,val){
            var newItem, ID;
            
            
            if (data.allItems[type].length > 0) {
                 ID = data.allItems[type][data.allItems[type].length-1].id +1;
            } else {
                ID = 0 ;
            }
            
            if (type=== 'exp'){
               newItem =new Expense(ID,des,val); 
            }
            else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            data.allItems[type].push(newItem);
            return newItem; 
        },
		
		
		getIDs: function(){
			var obj = {};
			var percentage;
			obj.ids= data.allItems.exp.map(function(current){
				return current.id;
			});
			obj.perc =data.allItems.exp.map(function(current){
				if(data.totals.inc>0) {
					percentage= (current.value/data.totals.inc)*100;
				} else {
					percentage = 0;
				}
				return Math.round(percentage);
			});
			
			return obj;			
		},
		
        calculateBudget: function(){
            calcTotal('exp');
            calcTotal('inc');
            data.budget= data.totals.inc - data.totals.exp;
			if(data.totals.inc > 0){
				data.percentage = Math.round((data.totals.exp/ data.totals.inc)*100);
			} else {
				data.percentage=-1;
			}
            
            
        },
        getBudget: function(){
            return{
                budget: data.budget,
                totalInc:data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
		
		deleteItem: function(type,id){
			var ids= data.allItems[type].map(function(current){
				return current.id;
			});
			
			var index= ids.indexOf(id);
			
			if(index !== -1){
				data.allItems[type].splice(index,1);	
			}
			
		},
		
        testing: function(){
            console.log(data);
        }
    };
    
})();

//UI controller-
var UIController =(function(){
    
    var DOMstrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer: '.income__list',
        expensesContainer:'.expenses__list',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		expensesPercLabel:'.budget__expenses--percentage',
		budgetLabel:'.budget__value',
		container: '.container'
    };
	
	var formatNumber = function(num, type) {
			var numSplit, int, dec, type;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];
			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
			}

			dec = numSplit[1];

			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

        };
    
    return{
        getInput:function (){
           return {
                type:document.querySelector(DOMstrings.inputType).value,
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
           };
        },
        getDOMstrings: function(){
            return DOMstrings;
        },
        
        addListItem: function(obj,type){
            var html,newhtml,element;
            // create HTML string  with placeholder tet
			if (type == 'inc'){
				 element= DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';   
			} else {
				element=DOMstrings.expensesContainer;
				html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage" id="expense-%id1%">%perc%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
               
            //replace the placeholder text with actual data
            newhtml= html.replace('%id%',obj.id);
            newhtml = newhtml.replace('%description%',obj.description);
            newhtml = newhtml.replace('%value%',formatNumber(obj.value,type));
			newhtml= newhtml.replace('%id1%',obj.id);
           
            //Inset the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml); 
            
        },
		showpercentage: function(id,perc){
			document.getElementById('expense-'+id).textContent=perc+'%';
		},
		clearFields: function(){
            var fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value= " ";
            });
            fieldsArr[0].focus();
        },				   
      
		displayBudget: function(obj){
			document.querySelector(DOMstrings.incomeLabel).textContent= obj.totalInc;
			document.querySelector(DOMstrings.expensesLabel).textContent= obj.totalExp;
			document.querySelector(DOMstrings.budgetLabel).textContent= obj.budget;
			
			if(obj.percentage > 0){
				document.querySelector(DOMstrings.expensesPercLabel).textContent= obj.percentage + '%';
			}else {
				document.querySelector(DOMstrings.expensesPercLabel).textContent= '-';
			}
			
		},
		
		deleteListItem: function(id){
			document.getElementById(id).parentNode.removeChild(document.getElementById(id));
		}
        
    };
})();


//Global controller
var controller= (function(budgetCtrl,UICtrl){
    
    //Set up event listeners-
    var setupEventListeners = function(){
       
        //get input IDs-
        var DOM= UICtrl.getDOMstrings();
        
        //input bt listeners - enter key and input btn.
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        	if(event.keyCode === 13 || event.which === 13){
            	ctrlAddItem();
        	}
        });
		
		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
		
    }
	
	var ctrlDeleteItem =function(event){
		var itemID,splitID,type,ID;
		itemID= event.target.parentNode.parentNode.parentNode.id;
		
		if(itemID){
			//extraction of ID-
			splitID= itemID.split('-');
			console.log(splitID);
			type= splitID[0];
			ID= parseInt(splitID[1]);
			
			//Deletion from BudgetCONTROL function-
			budgetCtrl.deleteItem(type,ID);
			
			
			//Deletion from UI-
			UICtrl.deleteListItem(itemID);
			
			//Budget Updation-
			updateBudget();
		}
	}
    
    function updateBudget(){
        //udation of budget.
        budgetCtrl.calculateBudget();
        // get budget
        var budget = budgetCtrl.getBudget();
		//update UI
		console.log(budget);
		//display budget-
		UICtrl.displayBudget(budget);
        
    };
    
   var ctrlAddItem = function(){
        var perc;
        //1. Get the filled input data
        var input = UICtrl.getInput();
        console.log(input);
       
       if(input.description !== "" && !isNaN(input.value) && input.value>0 ){
           
           //2. Add the item to budget controller
       var newItem=  budgetCtrl.addItem(input.type,input.description,input.value);
	   
	   //3. Add to UI controller
		UICtrl.addListItem(newItem, input.type);
		   
       
        //4. Clear Fields-
        UICtrl.clearFields();
       
        //5. Update and Calculate the Budget
        updateBudget();
           
        //6. show percentages-
		var perAndID = budgetCtrl.getIDs();
		console.log(perAndID);
	    perAndID.ids.forEach(function(current,index){
			//show percentage.
			UICtrl.showpercentage(current,perAndID.perc[index]);
		})
       }
        
    }; 
	
	function cur_month(month_no){
		switch(month_no){
			case 0: return 'January';
			case 1: return 'February';
			case 2: return 'March';
			case 3: return 'April';
			case 4: return 'May';
			case 5: return 'June';
			case 6: return 'July';
			case 7: return 'August';
			case 8: return 'September';
			case 9: return 'October';
			case 10: return 'November';
			case 11: return 'December';
			default: return '-1';
		 }
	};
   return{
       init: function(){
           console.log('Application has started');
		   var today= new Date();
		   var month_no = today.getMonth();
		   //console.log(today.getMonth());
		   var month=  cur_month(month_no);
		   
		   if(month !== '-1'){
			   document.querySelector('.budget__title--month').textContent= month;
		   };
		   
		   UICtrl.displayBudget({
			   budget:0,
			   totalExp:0,
			   totalInc:0,
			   percentage:'-'
		   });
		   
           setupEventListeners();
       }
   };
    
})(budgetController,UIController);

//start controller function-
controller.init();