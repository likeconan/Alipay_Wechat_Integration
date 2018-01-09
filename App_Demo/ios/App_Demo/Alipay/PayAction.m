//
//  PayAction.m
//  App_Demo
//
//  Created by Conan on 2018/1/9.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PayAction.h"
#import <AlipaySDK/AlipaySDK.h>


@implementation PayAction

RCT_EXPORT_MODULE();


RCT_REMAP_METHOD(pay,
                 orderString:(NSString *)orderString
                 findEventsWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *appScheme = @"alisdkdemo";
  
  [[AlipaySDK defaultService] payOrder:orderString fromScheme:appScheme callback:^(NSDictionary *resultDic) {
    resolve(resultDic);
  }];

}


@end
