import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from 'src/logger/logger.service';
import { ContentService } from './content.service';
import { CreateOrderDto } from './dto/create-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly logger: LoggerService,
  ) {}

  @Post('/search')
  async getContent(@Request() request, @Body() body) {
    this.logger.log('POST /search');
    return this.contentService.getJobs(body);
  }

  @Post('/responseSearch')
  async searchResponse(@Request() request, @Body() body) {
    this.logger.log('POST /responseSearch');
    return this.contentService.searchResponse(body);
  }

  @Get('/getState')
  async getState() {
    this.logger.log('GET /getState');
    return this.contentService.getState();
  }

  @Get('/getCity')
  async getCity(@Query('state') state: string) {
    this.logger.log('GET /getCity');
    return this.contentService.getCity(state);
  }

  @Get('/getTitle')
  async getTitle() {
    this.logger.log('GET /getTitle');
    return this.contentService.getTitle();
  }

  // create jobs manually
  @Post('/create')
  async contentapi() {
    this.logger.log('POST /create');
    return this.contentService.jobsApiCall();
    // return this.contentService.testApiCall()
  }

  @Post('/createOrder')
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.contentService.createOrder(createOrderDto);
  }

  @Get('/searchOrder/:OredrId')
  searchOrderByOrderId(@Param('OredrId') OredrId) {
    return this.contentService.searchOrderByOrderId(OredrId);
  }

  // create jobs by cronjob
  @Cron(CronExpression.EVERY_8_HOURS)
  async jobsApiCall() {
    this.logger.log('Cronjob create service executed at');
    return this.contentService.jobsApiCall();
  }

  // delete jobs by cronjob
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteJobs() {
    this.logger.log('Cronjob delete Jobs service executed at');
    let deletedResponse = await this.contentService.deleteJobs();
    if (deletedResponse) {
      console.log('response deleted successfully at ' + Date.now());
      return this.contentService.jobsApiCall();
    }
  }

  // delete response cache by cronjob
  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  // async deleteResponse() {
  //     this.logger.log('Cronjob delete Response executed at')
  //     return this.contentService.deleteResponse()
  // }

  @Post('/telemetry')
  async telemetry(@Request() request, @Body() body) {
    this.logger.log('POST /telemetry', JSON.stringify(body));
    return this.contentService.addTelemetry(body);
  }

  @Post('/analytics')
  async analytics(@Request() request, @Body() body) {
    this.logger.log('POST /analytics');
    console.log('body', body);
    return this.contentService.analytics(body);
  }

  @Post('/telemetryAnalytics')
  async telemetryAnalytics(@Request() request, @Body() body) {
    this.logger.log('GET /telemetryAnalytics');
    return this.contentService.telemetryAnalytics1(body);
  }

  @Get('/documents_list')
  @ApiResponse({
    status: 200,
    description: 'List of documents',
  })
  getCertificates() {
    const certificates = [
      { name: 'Income Certificate', code: 'Income_Certificate' },
      { name: 'Caste Certificate', code: 'Caste_Certificate' },
      { name: 'Disability Certificate', code: 'Disability_Certificate' },
      { name: 'Ration Card/BPL Card', code: 'Ration_Card_BPL_Card' },
      { name: 'Domicile Certificate', code: 'Domicile_Certificate' },
      {
        name: 'Business Certificate of Tehsildar',
        code: 'Business_Certificate_of_Tehsildar',
      },
      { name: 'Work Contract Certificate', code: 'Work_Contract_Certificate' },
      {
        name: 'Hostel Accommodation Certificate',
        code: 'Hostel_Accommodation_Certificate',
      },
      { name: 'Enrolment Certificate', code: 'Enrolment_Certificate' },
      { name: 'Marksheet', code: 'Marksheet' },
      { name: 'Birth Certificate', code: 'Birth_Certificate' },
    ];

    return {
      success: true,
      message: 'Documents fetched successfully',
      data: certificates,
    };
  }
  @Post('/encrypt')
  async encrption(@Request() request, @Body() body) {
    return this.contentService.encryption(body);
  }

  @Post('/decrypt')
  async decryption(
    @Request() request,
    @Body() body: { encryptedData: string },
  ) {
    return this.contentService.decryption(body.encryptedData);
  }
}
