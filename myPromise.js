class myPromise {
    constructor(excutor) {
        const self = this;
        self.PromiseState = "pending"
        self.PromiseResult = undefined
        self.callbacks = []
        function resolve(data) {
            if(self.PromiseState !== "pending") return;
            self.PromiseState = "fulfilled"
            self.PromiseResult = data
            setTimeout(() => {
                self.callbacks.forEach(callback => {
                    if(callback.onResolved)
                        callback.onResolved(data)
                })
            })
        }
        function reject(data) {
            if(self.PromiseState !== "pending") return;
            self.PromiseState = "rejected"
            self.PromiseResult = data
            setTimeout(() => {
                self.callbacks.forEach(callback => {
                    if(callback.onRejected)
                        callback.onRejected(data)
                })
            })
        }
        try {
            excutor(resolve, reject)
        } catch(err) {
            reject();
            throw err
        }
    }
    then(onResolved, onRejected) {
        const self = this;
        if(!(onRejected instanceof Function)) {
            onRejected = (reason) => {
                throw reason
            }
        }
        return new myPromise((resolve, reject) => {
            function callback(func) {
                try {
                    let result = func(self.PromiseResult);
                    if(result instanceof myPromise) {
                        result.then(value => {
                            resolve(value)
                        }, reason => {
                            reject(reason)
                        })
                    }
                    else resolve(result)
                } catch(err) {
                    reject(err)
                }
            }
            if(this.PromiseState === "fulfilled") {
                setTimeout(() => {
                    callback(onResolved)
                })
            }
            else if(this.PromiseState === "rejected") {
                setTimeout(() => {
                    callback(onRejected)
                })
            }
            else if(this.PromiseState === "pending") {
                this.callbacks.push({
                    onResolved: function() {
                        callback(onResolved)
                    },
                    onRejected: function() {
                        callback(onRejected)
                    }
                })
            }
        })
    }
    catch(onRejected) {
        return this.then(null, onRejected)
    }
    static resolve(data) {
        return new myPromise((resolve, reject) => {
            if(data instanceof myPromise) {
                data.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            }
            else resolve(data)
        })
    }
    static reject(data) {
        return new myPromise((resolve, reject) => {
            reject(data)
        })
    }
    static all(iterable) {
        let arr = []
        let count = 0
        return new myPromise((resolve, reject) => {
            iterable.forEach(function(element, index) {
                if(element instanceof myPromise) {
                    element.then(value => {
                        ++count;
                        arr[index] = value
                        if(count === iterable.length) {
                            resolve(arr)
                        }
                    }, reason => {
                        reject(reason)
                    })
                }
                else arr[index] = element
            })
        })
    }
    static race(iterable) {
        return new myPromise((resolve, reject) => {
            iterable.forEach((element) => {
                element.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            })
        })
    }
}
// (function() {
//     function myPromise(excutor) {
//         const self = this;
//         self.PromiseState = "pending"
//         self.PromiseResult = undefined
//         self.callbacks = []
//         function resolve(data) {
//             if(self.PromiseState !== "pending") return;
//             self.PromiseState = "fulfilled"
//             self.PromiseResult = data
//             setTimeout(() => {
//                 self.callbacks.forEach(callback => {
//                     if(callback.onResolved)
//                         callback.onResolved(data)
//                 })
//             })
//         }
//         function reject(data) {
//             if(self.PromiseState !== "pending") return;
//             self.PromiseState = "rejected"
//             self.PromiseResult = data
//             setTimeout(() => {
//                 self.callbacks.forEach(callback => {
//                     if(callback.onRejected)
//                         callback.onRejected(data)
//                 })
//             })
//         }
//         try {
//             excutor(resolve, reject)
//         } catch(err) {
//             reject();
//             throw err
//         }
//     }
//     myPromise.resolve = function(data) {
//         return new myPromise((resolve, reject) => {
//             if(data instanceof myPromise) {
//                 data.then(value => {
//                     resolve(value)
//                 }, reason => {
//                     reject(reason)
//                 })
//             }
//             else resolve(data)
//         })
//     }
//     myPromise.reject = function(data) {
//         return new myPromise((resolve, reject) => {
//             reject(data)
//         })
//     }
//     myPromise.all = function(iterable) {
//         let arr = []
//         let count = 0
//         return new myPromise((resolve, reject) => {
//             iterable.forEach(function(element, index) {
//                 if(element instanceof myPromise) {
//                     element.then(value => {
//                         ++count;
//                         arr[index] = value
//                         if(count === iterable.length) {
//                             resolve(arr)
//                         }
//                     }, reason => {
//                         reject(reason)
//                     })
//                 }
//                 else arr[index] = element
//             })
//         })
//     }
//     myPromise.race = function(iterable) {
//         return new myPromise((resolve, reject) => {
//             iterable.forEach((element) => {
//                 element.then(value => {
//                     resolve(value)
//                 }, reason => {
//                     reject(reason)
//                 })
//             })
//         })
//     }
//     myPromise.prototype.then = function(onResolved, onRejected) {
//         const self = this;
//         if(!(onRejected instanceof Function)) {
//             onRejected = (reason) => {
//                 throw reason
//             }
//         }
//         return new myPromise((resolve, reject) => {
//             function callback(func) {
//                 try {
//                     let result = func(self.PromiseResult);
//                     if(result instanceof myPromise) {
//                         result.then(value => {
//                             resolve(value)
//                         }, reason => {
//                             reject(reason)
//                         })
//                     }
//                     else resolve(result)
//                 } catch(err) {
//                     reject(err)
//                 }
//             }
//             if(this.PromiseState === "fulfilled") {
//                 setTimeout(() => {
//                     callback(onResolved)
//                 })
//             }
//             else if(this.PromiseState === "rejected") {
//                 setTimeout(() => {
//                     callback(onRejected)
//                 })
//             }
//             else if(this.PromiseState === "pending") {
//                 this.callbacks.push({
//                     onResolved: function() {
//                         callback(onResolved)
//                     },
//                     onRejected: function() {
//                         callback(onRejected)
//                     }
//                 })
//             }
//         })
//     }
//     myPromise.prototype.catch = function(onRejected) {
//         return this.then(null, onRejected)
//     }
// })()