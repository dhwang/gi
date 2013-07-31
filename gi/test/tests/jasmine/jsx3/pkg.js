/*
 * Copyright (c) 2001-2013, TIBCO Software Inc.
 * Use, modification, and distribution subject to terms of license.
 */

 describe("jsx3 - Javascript extended functions", function(){
	var _jasmine_test = gi.test.jasmine;
  _jasmine_test.require("jsx3.jsxpackage", "jsx3.app.Cache", "jsx3.lang.System");
	
    it("has method eval() that could be evaluate a javasccript expression in a controlled local variable context.", function(){
      expect(jsx3.eval("2+3")).toEqual(5);
    });
    
    it("has method eval() could be evalute a javascript expression which has params", function(){
      expect(jsx3.eval("x+y",{x:2,y:3})).toEqual(5);
    });
    
    it("has method eval() could be evalute a javascript expression which has bad params", function(){
      expect(jsx3.eval("x+y",{x:2,y:3,"a b c":5})).toEqual(5);
    });
    
    it("has method eval() could be evaltute a javascript expression which the params include reserved word.", function(){
      expect(jsx3.eval("x+y",{x:2,y:3,"function":1,"if":2})).toEqual(5);
    });
    
    it("has setEnv() to set the value of a system-wide environment variable", function(){
      jsx3.setEnv("testkey", "testvalue");
			expect(jsx3.getEnv("testkey")).toEqual("testvalue");
    });
    
    it("has getEnv() to return the value of a system-wide environment variable", function(){
      jsx3.setEnv("testkey", "testvalue");
      jsx3.setEnv("TestKey2", "testvalue2");
      expect(jsx3.getEnv("testkey")).toEqual("testvalue");
      expect(jsx3.getEnv("TestKey")).toEqual("testvalue");
      expect(jsx3.getEnv("TestKey2")).toEqual("testvalue2");
      expect(jsx3.getEnv("Testkey2")).toEqual("testvalue2");
    });
    
    it("has method getSharedCache() to get the global JSX XML/SXL cache", function(){
      var c = jsx3.getSharedCache();
      expect(c).toBeInstanceOf(jsx3.app.Cache);
    });
    
    it("has method jsx3.sleep() which executes code in a queue and out of band using setTimeout()", function(){
      var flag,value;
      runs(function(){
        jsx3.sleep(function() {
					flag = true;
				});
      });
      waitsFor(function(){
        return flag;
      },"the value will be increament", 750)
      
      runs(function(){
        expect(flag).toBeTruthy();
      })
      
    });
    
    it("has method sleep() which is replace for peppering code with window.setTimeout() statement", function(){
      var obj ={};
      runs(function(){
        jsx3.sleep(function(){
          expect(this).not.toBeNull();
          expect(this).toEqual(obj);;
        });
      })
    });
    
    it("has method sleep() which is replace for peppering code with window.setTimeout() statement", function(){
      var firstExecuted, secondExecuted;
      runs(function(){
        firstExecuted = false;
        secondExecuted = false;
      });
      waitsFor(function(){
        jsx3.sleep(function() {
          firstExecuted = true;
        }, "dupId");
        jsx3.sleep(function() {
          secondExecuted = true;
        }, "dupId");
        return true;
      },"",750);
      runs(function(){
        window.setTimeout(function(){
          expect(firstExecuted).toBeTruthy();
          expect(secondExecuted).toBeFalsy();
        },1000);
      })
    });
    
    it("has method sleep() which is replace for peppering code with window.setTimeout() statement", function(){
      var firstExecuted, secondExecuted;
      runs(function(){
        firstExecuted = false; 
        secondExecuted = false;
      });
      waitsFor(function(){
        jsx3.sleep(function() {
          firstExecuted = true;
        }, "dupId");
        jsx3.sleep(function() {
          secondExecuted = true;
        }, "dupId", null, true);
        return true;
      },"",750);
      runs(function(){
        window.setTimeout(function(){
          expect(firstExecuted).toBeFalsy();
          expect(secondExecuted).toBeTruthy();
        },1000);
      });
    });
    
    it("should has sleep throw when excute sleep()", function(){
      var secondExecuted;  
      runs(function(){
        secondExecuted = false;
      });
      
      waitsFor(function(){
        jsx3.sleep(function() {
          jsx3.sleep(function() {
            secondExecuted = true;
          });
          throw new Error();
        });
        return true;
      },"",750);
      
      runs(function(){
        window.setTimeout(function(){
          expect(secondExecuted).toBeTruthy();
        })
      })
      
    });
    
    it("can be throw exception when excute sleep()", function(){
      var secondExecuted = false;
      runs(function(){
        jsx3.sleep(function() {
          throw new Error();
        });
      });
      
      waitsFor(function(){
        jsx3.sleep(function() {
          secondExecuted = true;
        });
        return true;
      },"",750);
      
      runs(function(){
        window.setTimeout(function(){
          expect(secondExecuted).toBeTruthy();
        },1000)
      });
      
    });
    
    it("should has method require() to import package:1", function(){
      if (jsx3.app && jsx3.app.UserSettings){
        delete jsx3.app.UserSettings;
      }
      
      if(jsx3.app){
        expect(jsx3.app.UserSettings).not.toBeDefined();
      }
      
      jsx3.require("jsx3.app.UserSettings");
      
      expect(jsx3.app.UserSettings).toBeDefined();
      expect(jsx3.app.UserSettings.jsxclass).toBeInstanceOf(jsx3.lang.Class);
    });
    
    it("should has method require() to import package 2", function(){
      var e = null;
      if(jsx3.app && jsx3.app.UserSettings){
        delete jsx3.app.UserSettings;
      }
      
      if(jsx3.app){
        expect(jsx3.app.UserSettings).not.toBeDefined();
      }
      
      jsx3.sleep(function(){
        jsx3.require("jsx3.app.UserSettings");
        try{
          expect(jsx3.app.UserSettings).toBeDefined();
        }catch(ex){
          e = ex;
        }
      });
      
      if(e == null){
        jsx3.sleep(function(){
          try{
            expect(jsx3.app.UserSettings).toBeDefined();
            expect(jsx3.app.UserSettings.jsxclass).toBeInstanceOf(jsx3.lang.Class);
          }catch(ex){
            e = ex;
          }
          
          if(e == null){
            try{
              jsx3.require("jsx3.app.UserSettings");
            }catch(ex){
              e = ex;
            }
          }
        });
      }
      
      jsx3.sleep(function(){
        if(e) throw e;
      })
    });
    
    it("should has method requireAsync() to async require package", function(){
      runs(function(){
        if(jsx3.net && jsx3.net.Form){
          delete jsx3.net.Form;
        }
      });
      
      waitsFor(function(){
        if(jsx3.net){
          expect(jsx3.net.Form).not.toBeDefined();
        }
        return true;
      },"",750);
      
      runs(function(){
        jsx3.requireAsync("jsx3.net.Form").when(function(){
          expect(jsx3.net.Form).toBeDefined();
          expect(jsx3.net.Form.jsxclass).toBeInstanceOf(jsx3.lang.Class);
        })
      });
    });
    
    it("will throw exception when async bad package", function(){
       expect(function(){
        jsx3.requireAsync("jsx3.notapackage.Class");
       }).toThrow();
    });
    
    it("should not excute callback when reuqire async bad package", function(){
      runs(function(){
        expect(jsx3.util.notAClass).not.toBeDefined();
      });
      
      waitsFor(function(){
        return true;
      },"",750);
      
      runs(function(){
        jsx3.requireAsync("jsx3.util.NotAClass").when(function(){
          expect(false).toBeTruthy();
        })
      });
      
      runs(function(){
        window.setTimeout(function(){
          expect(jsx3.util.NotAClass).not.toBeDefined();
        });
      });
    });
 })