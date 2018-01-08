package com.app_demo.alipay;

import android.app.Activity;
import android.text.TextUtils;
import com.alipay.sdk.app.EnvUtils;
import com.alipay.sdk.app.PayTask;
import com.app_demo.MainActivity;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;

/**
 * Created by Conan on 2018/1/8.
 */

public class PayAction extends ReactContextBaseJavaModule {


    public PayAction(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PayAction";
    }

    @ReactMethod
    public void pay(final String orderInfo, final Promise promise) {
        //支付宝沙箱android测试需要调用
        //EnvUtils.setEnv(EnvUtils.EnvEnum.SANDBOX);

        Runnable payRunnable = new Runnable() {
            @Override
            public void run() {
                Activity activty = MainActivity.getActivity();
                PayTask alipay = new PayTask(activty);
                Map<String, String> result = alipay.payV2(orderInfo, true);
                PayResult payResult = new PayResult((Map<String, String>) result);
                String resultInfo = payResult.getResult();
                String resultStatus = payResult.getResultStatus();
                String memo = payResult.getMemo();
                try {
                    if (TextUtils.equals(resultStatus, "9000")) {
                        promise.resolve(resultInfo);
                    } else {
                        promise.reject("error", memo);
                    }
                } catch (Exception e) {
                    promise.reject("error", e.getMessage());
                }


            }
        };
        Thread payThread = new Thread(payRunnable);
        payThread.start();
    }


}
