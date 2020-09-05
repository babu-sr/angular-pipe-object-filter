import { Pipe, PipeTransform } from '@angular/core';
import { Filters, TypeChecker } from './object-filter.model';

@Pipe({
	name: 'objectFilter'
})
export class ObjectFilterPipe implements PipeTransform {
	/**
   * @param {string} value Array or JSON.
   * @param {TypeChecker} typeChecker JSON.
   * @param {Filters} filters Array of JSON.
   * @example [] : [{type : 'object',key:'values'}] : [{ 'key': 'values.value', 'string' : [null, undefined,''], 'condition' : 'not'}]
   */
	transform(
		value: any,
		typeChecker?: TypeChecker | Array<TypeChecker> | null,
		filters?: Array<Filters>,
		changeIndicator?: any
	): any {
		let returnData = [];

		if (![null, undefined].includes(typeChecker)) {
			returnData = this.typeFilter(value, typeChecker);
		}
		if (returnData.length) {
			returnData = this.arrayFilter(returnData, filters);
		} else {
			returnData = this.objectFilter(value, filters);
		}

		return returnData;
	}

	protected typeFilter(filterData, typeChecker) {
		let returnData: Array<any> = filterData;
		if (Array.isArray(typeChecker)) {
			for (const resp of typeChecker) {
				returnData = returnData.concat(this.typeFilter(returnData, resp));
			}
		} else if (typeChecker.type && typeChecker.type === 'UNIQUE') {
			returnData = this.uniqueChecker(filterData, typeChecker);
		} else if (typeChecker.type && typeChecker.type === 'DUPLICATE') {
		} else if (typeChecker.key && typeChecker.key !== '') {
			returnData = returnData.filter(
				(items) => items[typeChecker.key] != null && typeof items[typeChecker.key] === typeChecker.type
			);
		} else {
			returnData = returnData.filter((items) => typeof items === typeChecker.type);
		}
		return returnData;
	}

	protected arrayFilter(filterData, filters: Array<Filters>, filterIndex = 0) {
		filterData = Array.from(filterData);
		let returnData = [];
		if (filters.length) {
			const filterResp = filters[filterIndex];
			filterIndex = filterIndex + 1;

			let filterKeyArr = [];
			if (filterResp.key && filterResp.string) {
				if (typeof filterResp.key === 'string' || typeof filterResp.key === 'number') {
					filterKeyArr = filterResp.key.toString().split('.');
				} else {
					filterKeyArr = filterResp.key;
				}
			}

			let filterStringArr = [];
			if (filterResp.string) {
				if (typeof filterResp.string === 'string' || typeof filterResp.string === 'number') {
					filterStringArr = filterResp.string.toString().split(',');
				} else {
					filterStringArr = filterResp.string;
				}
			}

			returnData = filterData.filter((items) => {
				let state = this.valueChecker(items, filterKeyArr, filterStringArr);
				if (state === undefined) {
					state = false;
				}
				if (filterResp.condition === 'not') {
					return !state;
				} else if (filterResp.condition === 'equal') {
					return state;
				} else {
					return state;
				}
			});

			if (filters.length > filterIndex) {
				returnData = this.arrayFilter(returnData, filters, filterIndex);
			}
		} else {
			returnData = filterData;
		}
		return returnData;
	}

	valueChecker(item, filterKey, filterValue, index = 0) {
		const loopIndex = index + 1;
		if (filterKey.length > 1 && loopIndex < filterKey.length) {
			if (typeof item[filterKey[index]] === 'object') {
				return this.valueChecker(item[filterKey[index]], filterKey, filterValue, index + 1);
			} else {
				return filterValue.includes(item[filterKey[index]]);
			}
		} else if (typeof item === 'string') {
			return filterValue.includes(item);
		} else {
			return filterValue.includes(item[filterKey[index]]);
		}
	}

	uniqueChecker(dataArr, property, index = 0) {
		return (
			dataArr
				.map((e) => e[property])
				// store the keys of the unique objects
				.map((e, i, final) => final.indexOf(e) === i && i)
				// eliminate the dead keys & store unique objects
				.filter((e) => dataArr[e])
				.map((e) => dataArr[e])
		);
	}

	protected objectFilter(filterData, filters: Array<Filters>, filterIndex = 0) {
		const returnArr = [];
		const filterResp = filters[filterIndex];
		filterIndex = filterIndex + 1;

		Object.keys(filterData).map((resp) => {
			if (filterResp.key && filterResp.string) {
				let filterStringArr;
				if (typeof filterResp.string === 'string' || typeof filterResp.string === 'number') {
					filterStringArr = filterResp.string.toString().split(',');
				} else {
					filterStringArr = filterResp.string;
				}

				let filterKeyArr;
				if (typeof filterResp.key === 'string' || typeof filterResp.key === 'number') {
					filterKeyArr = filterResp.key.toString().split('.');
				} else {
					filterKeyArr = filterResp.key;
				}

				let state = this.valueChecker(filterData[resp], filterKeyArr, filterStringArr);
				if (state === undefined) {
					state = false;
				}
				if (filterResp.condition === 'not') {
					if (!state) {
						returnArr.push(filterData[resp]);
					}
				} else if (filterResp.condition === 'equal') {
					if (state) {
						returnArr.push(filterData[resp]);
					}
				} else {
					if (state) {
						returnArr.push(filterData[resp]);
					}
				}
			} else {
				returnArr.push(filterData[resp]);
			}
		});
		return returnArr;
	}
}

//////////////////////// Old Code ///////////////////////////

// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({
//   name: 'objectFilter'
// })
// export class ObjectFilterPipe implements PipeTransform {

//   transform(value: any, args?: any, filterKey?: any, filterString?: any, filterCondition?: any, nullEmptyCheckData?: any): any {
//     let loopArr, test = null;

//     if (value.length)
//       loopArr = this.arrayFilter(value, filterKey, filterString, filterCondition);
//     else
//       loopArr = this.objectFilter(value, filterKey, filterString, filterCondition);

//     let returnData = loopArr;

//     if (args) {
//       returnData = this.typeFilter(returnData, args);
//     }
//     if (nullEmptyCheckData) {
//       returnData = this.nullEmptyCheckFilter(returnData, nullEmptyCheckData);
//     }
//     return returnData;
//   }
//   // demoJson = [{
//   //   fieldKey:'demo',
//   //   values:{
//   //     value:{
//   //       hie:'hai'
//   //     }
//   //   }
//   // }]

//   protected nullEmptyCheckFilter(filterData, nullEmptyCheckData) {
//    let returnArr = [];
//    if(nullEmptyCheckData.key != '' && nullEmptyCheckData.key) {
//     // return filterData.filter(items => items[nullEmptyCheckData.key].value != '' && items[nullEmptyCheckData.key].value != null);
//       if (nullEmptyCheckData.condition == 'equal')
//       return filterData.filter(items => items[nullEmptyCheckData.key].value == null  && items[nullEmptyCheckData.key].value == '' );
//       if (nullEmptyCheckData.condition == 'not')
//       return filterData.filter(items => items[nullEmptyCheckData.key].value != null && items[nullEmptyCheckData.key].value != '' );

//    }

//   }
//   protected typeFilter(filterData, args) {
//     if (args.key && args.key != '') {
//       return filterData.filter(items => (items[args.key] != null && typeof items[args.key] === args.type));
//     } else {
//       return filterData.filter(items => typeof items === args.type);
//     }
//   }

//   protected arrayFilter(filterData, filterKey, filterString, filterCondition) {
//     filterData = Array.from(filterData);
//     if (filterKey && filterString != undefined) {
//       let filterStringArr;
//       if (typeof filterString == 'string')
//         filterStringArr = filterString.split(',');
//       else
//         filterStringArr = filterString;
//       if (filterCondition == 'not')
//         return filterData.filter(items => !filterStringArr.includes(items[filterKey]));
//       else if (filterCondition == 'equal')
//         return filterData.filter(items => filterStringArr.includes(items[filterKey]));
//       else
//         return filterData.filter(items => filterStringArr.includes(items[filterKey]));
//     } else if(filterString != '' && filterString != undefined){
//       let filterStringArr;
//       if (typeof filterString == 'string')
//         filterStringArr = filterString.split(',');
//       else
//         filterStringArr = filterString;
//       if (filterCondition == 'not')
//         return filterData.filter(items => !filterStringArr.includes(items));
//       else if (filterCondition == 'equal')
//         return filterData.filter(items => filterStringArr.includes(items));
//       else
//         return filterData.filter(items => filterStringArr.includes(items));
//     } else {
//       return filterData;
//     }
//   }

//   protected objectFilter(filterData, filterKey, filterString, filterCondition) {
//     // filterData = Object.values(filterData);
//     let returnArr = [];
//     Object.keys(filterData).map(resp => {
//       if (filterKey && filterString != undefined) {
//         let filterStringArr;
//         if (typeof filterString == 'string')
//           filterStringArr = filterString.split(',');
//         else
//           filterStringArr = filterString;

//         if (filterCondition == 'not') {
//           if (!filterStringArr.includes(resp)) {
//             returnArr.push(filterData[resp]);
//           }
//         } else if (filterCondition == 'equal') {
//           if (filterStringArr.includes(resp)) {
//             returnArr.push(filterData[resp]);
//           }
//         } else {
//           if (filterStringArr.includes(resp)) {
//             returnArr.push(filterData[resp]);
//           }
//         }
//       } else {
//         returnArr.push(filterData[resp]);
//       }
//     });
//     return returnArr;
//   }

// }
