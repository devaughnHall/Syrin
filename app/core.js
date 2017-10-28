function getStyle(oElm, strCssRule){
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        strValue = document.defaultView.getComputedStyle(oElm, "");//.getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
          radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

function resize($rootScope){
   var
        composer = document.getElementById("composer")
        ,trackBar = document.getElementById("track-bar")
        ,browser = document.getElementById("browser")
        ,canvas = document.getElementById("composer-canvas")
        ,tracks = document.getElementsByClassName("track")
        ,ctx = canvas.getContext("2d")
    ;

    $rootScope.height = canvas.height;
    $rootScope.width = canvas.width;

    $rootScope.width = ctx.canvas.width = (
        (window.innerWidth ) -
        (
            Number(getStyle(trackBar).width.replace('px','')) +
            Number(getStyle(trackBar).paddingLeft.replace('px','')) +
            Number(getStyle(trackBar).paddingRight.replace('px','')) +
            Number(getStyle(browser).width.replace('px','')) +
            Number(getStyle(browser).paddingLeft.replace('px','')) +
            Number(getStyle(browser).paddingRight.replace('px','')) +
            17
        )
    );
    $rootScope.height = ctx.canvas.height = (
        Number(getStyle(trackBar).height.replace('px','')) +
        Number(getStyle(trackBar).paddingBottom.replace('px','')) +
        Number(getStyle(trackBar).paddingTop.replace('px','')) +
        1
    );

    console.log(//test
        ctx.canvas.width,
        window.innerWidth,
        getStyle(trackBar).width.replace('px',''),
        Number(getStyle(trackBar).paddingLeft.replace('px','')) ,
        Number(getStyle(trackBar).paddingRight.replace('px','')),
        getStyle(browser).width.replace('px','')
    );

}

angular.module('syrin',[])

    .controller('trackController',['$scope','$interval','$log',function($scope,$interval,$log){}])

    .controller('composer',['$scope','$rootScope','$interval','$log','$http',"Part",function($scope,$rootScope,$interval,$log,$http,Part){
        // angular.element(document).ready(function ($scope) {
            function getElem(x){
                return angular.element(document).find(x);
            }

            var
                composer = document.getElementById("composer")
                ,trackBar = document.getElementById("track-bar")
                ,browser = document.getElementById("browser")
                ,canvas = document.getElementById("composer-canvas")
                ,tracks = document.getElementsByClassName("track")
                ,columnWidth = topOffset = 20
                ,ctx = canvas.getContext("2d")

                //consrtuctors
                ,Part = new Part.part();
            ;

            $scope.parts = []
            ,$scope.trackHeight
            ,$rootScope.height = canvas.height
            ,$rootScope.width = canvas.width;


            function vertical(x,width){// vertical

                if(width){
                    ctx.lineWidth = width;
                }else{
                    ctx.lineWidth = 0.5;
                }
                ctx.beginPath();
                ctx.moveTo(x,0);
                ctx.lineTo(x, $rootScope.height);
                ctx.closePath();
                ctx.strokeStyle = "#555";
                ctx.stroke();
            }



            function horizontal(y){// horizontal
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0,y);
                ctx.lineTo($rootScope.width,y);
                ctx.closePath();
                ctx.strokeStyle = "#555";
                ctx.stroke();
            }

            $scope.createPart = function(x,y,bl,name,color){

                var part = new Part();

                part.x = x;
                part.y = y;
                part.barLength = bl;
                part.name = name;
                part.width = columnWidth * bl;
                part.color = color;



                $scope.parts.push(part);

                return part;

            }

            $scope.drawGrid = function(){
                for(var i = 1; i -1 <  $rootScope.width/20;i++){//draw numbers
                    ctx.font = "bold 12px Arial";
                    ctx.fillStyle = "red";
                    if(i%2 !== 0){//show odd numbers
                        vertical((i-1)*20,2);
                        vertical(i*20,0.5);
                        ctx.fillText(String(i),(i-1)*80,20);
                    }
                    else{

                    }
                }

                horizontal(20);

                //line for the bottom of each track
                angular.forEach(tracks,function(track,key){
                    key++;
                    $scope.trackHeight =  Number(getStyle(track).height.replace('px','')) +
                    Number(getStyle(track).paddingTop.replace('px','')) +
                    Number(getStyle(track).paddingBottom.replace('px',''))
                    ;
                    horizontal(20 + ( $scope.trackHeight * key));//offset the top by 20;
                    return $scope.trackHeight;
                });



                //for(var i= 0;i < i; i++){}
            }

            $scope.getOptions = function(){
                $http.get('options.json').then(function(data){
                    $rootScope.options = data;
                });
            }


            $scope.run = function(){
                var n;
                ctx.clearRect(0,0,$rootScope.width,$rootScope.height);
                $scope.drawGrid();



                //draw parts
                for(var i=0; i< $scope.parts.length; i++){
                    $scope.parts[i].draw(ctx);
                }

                if($scope.parts.length >  1){
                    for(var i= $scope.parts.length-1; i > 0; i--){
                        $log.log($scope.parts[i]);
                        var p = $scope.parts[i];
                        if(p.name.hasProperty("startsWith") && p.name.startsWith("new part")){
                            if($scope.parts.name.split(" ")[1]){
                                n = Number($scope.parts.name.split(" ")[1]);
                                n++;
                                break;
                            }
                        }else{

                        }
                    }
                }else{

                }
                //$scope.parts.draw();

            }

            $scope.init = function($interval){
                //$scope.getOptions();
                resize($rootScope);
                $interval($scope.run,200);// 1/4 second

                //create a scratch part
                $scope.createPart(0, topOffset, 8,"new part","red" );
            }

            $scope.init($interval);
        // });

        //events

        $scope.getCoords = function(e,elem){
            e.preventDefault();
            var obj = {x:0,y:0};
            // important: correct mouse position:
            var rect = canvas.getBoundingClientRect();
            obj.x = e.clientX - rect.left;
            obj.y = e.clientY - rect.top;
            return obj;
        }

        $scope.collision = function(obj1,obj2){
            if(ob1){}
        }

        $scope.mousemove = function(event){
            var elem = this;
            event.preventDefault();

            var c = $scope.getCoords(event);


            //if hover over part
            if($scope.parts.length){
                for(var i= 0; i < $scope.parts.length; i++){
                    var p = $scope.parts[i];
                    $log.log("moving", c,p);
                    //$log.log( p.name);

                    if(
                        c.x > p.x
                        && c.y > p.y
                        && c.x <= p.width
                        && c.y <= (p.y + $scope.trackHeight)
                    ){
                        //then do this
                        // $log.log(" over " + p.name, $scope.trackHeight)
                        $scope.isMoving = true;
                        p.color = "#0C0"
                        ;
                    }
                }
            }
        }

        $scope.click = function(){
            e.preventDefault();
        }

        $scope.dblClick = function(){
            e.preventDefault();
            if(x){}
        }

        $scope.touch = function(){
            e.preventDefault();
        }

        $scope.rightClick = function(){}
    }])


    //directives
    .directive('resize', function($window,$rootScope) {
      return {
        link: function(scope) {
          function onResize(e) {
            // Namespacing events with name of directive + event to avoid collisions
            scope.$broadcast('resize::resize');

            resize($rootScope);

          }

          function cleanUp() {
            angular.element($window).off('resize', onResize);
          }

          angular.element($window).on('resize', onResize);
          scope.$on('$destroy', cleanUp);
        }
      }
    })

;
